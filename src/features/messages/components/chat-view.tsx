"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  useMessagesQuery,
  useSendMessageMutation,
} from "@/features/messages/api/use-messages";
import { useSettlementQuery } from "@/features/rooms/api/use-settlement";
import type { UserType } from "@/features/user/api/user.types";
import type { ChatMessage } from "@/features/messages/api/messages.types";
import type { RoomCallStatus } from "@/features/rooms/api/room.types";
import { MessageBubble } from "@/features/messages/components/message-bubble";
import { MessageInput } from "@/features/messages/components/message-input";
import { SettlementNoticeCard } from "@/features/rooms/components/settlement-notice-card";

type Props = {
  roomId: string;
  me: UserType | undefined;
  isHost?: boolean;
  callStatus: RoomCallStatus;
};

const STICK_THRESHOLD_PX = 80;

const TAXI_CALLED_KEY = (roomId: string) => `yata:taxi-called-at:${roomId}`;
const TAXI_CALLED_VIRTUAL_ID = "__virtual__taxi-called__";

export function ChatView({ roomId, me, isHost, callStatus }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef(true);
  const [showNewBadge, setShowNewBadge] = useState(false);

  const messagesQuery = useMessagesQuery(roomId);
  const sendMutation = useSendMessageMutation(roomId, me);
  const settlementQuery = useSettlementQuery(roomId);
  const settlement = settlementQuery.data ?? null;

  // callStatus === "called" 진입 시각을 로컬에 저장해 채팅에 시스템 메시지로 표시.
  // 백엔드 전송이 아니므로 클라이언트별 인지(새로고침 후에도 유지)에 그친다.
  const [taxiCalledAt, setTaxiCalledAt] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(TAXI_CALLED_KEY(roomId));
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = TAXI_CALLED_KEY(roomId);
    if (callStatus === "called") {
      if (!taxiCalledAt) {
        const now = new Date().toISOString();
        window.localStorage.setItem(key, now);
        setTaxiCalledAt(now);
      }
      return;
    }
    // settling/completed 는 호출이 실제 일어났으므로 유지, pending/calling 으로 돌아갔을 때만 정리.
    if (
      (callStatus === "pending" || callStatus === "calling") &&
      taxiCalledAt
    ) {
      window.localStorage.removeItem(key);
      setTaxiCalledAt(null);
    }
  }, [callStatus, roomId, taxiCalledAt]);

  // image 종류는 아직 미지원 — 표시 자체를 안 함.
  // 가상 택시 호출 시스템 메시지가 있으면 createdAt 기준으로 합쳐 정렬.
  const messages = useMemo(() => {
    const base = (messagesQuery.data ?? []).filter((m) => m.kind !== "image");
    if (!taxiCalledAt) return base;
    const virtualTaxiMessage: ChatMessage = {
      id: TAXI_CALLED_VIRTUAL_ID,
      senderId: "__system__",
      senderName: "system",
      avatarUrl: null,
      kind: "system",
      text: "호스트가 택시를 호출했어요",
      attachmentUrl: null,
      data: null,
      createdAt: taxiCalledAt,
    };
    return [...base, virtualTaxiMessage].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }, [messagesQuery.data, taxiCalledAt]);
  const hasAnnouncement = messages.some((m) => m.kind === "announcement");
  const lastSettlementRefetchRef = useRef<string | null>(null);

  // ── 가짜 typing indicator ──────────────────────────────────────────────
  // 폴링 기반이라 새 메시지가 갑자기 떠서 부자연스러움 → 다른 사람의 신규 메시지를
  // 잠시 숨기고 "..." typing bubble 을 띄운 뒤 노출. 본인/시스템/announcement 는
  // 그대로 즉시 노출.
  const [displayedMessages, setDisplayedMessages] = useState<ChatMessage[]>([]);
  const [typingFromName, setTypingFromName] = useState<string | null>(null);
  const lastIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      // 첫 fetch 가 끝날 때까지(=메시지 1개라도 오기 전까지) 기다리되,
      // 빈 방인 경우엔 그냥 빈 배열로 초기화.
      setDisplayedMessages(messages);
      lastIdsRef.current = new Set(messages.map((m) => m.id));
      if (messages.length > 0) initializedRef.current = true;
      return;
    }

    const currentIds = new Set(messages.map((m) => m.id));
    const sameSet =
      currentIds.size === lastIdsRef.current.size &&
      [...currentIds].every((id) => lastIdsRef.current.has(id));
    if (sameSet) return;

    const newOnes = messages.filter((m) => !lastIdsRef.current.has(m.id));
    const delayedOnes = newOnes.filter(
      (m) =>
        !m.id.startsWith("optimistic-") &&
        m.senderId !== (me?.id ?? "") &&
        m.kind !== "announcement" &&
        m.kind !== "system",
    );

    if (delayedOnes.length === 0) {
      // 즉시 노출 — 본인 메시지, optimistic, system/announcement 등.
      setDisplayedMessages(messages);
      lastIdsRef.current = currentIds;
      return;
    }

    // 본인/시스템 등 즉시 노출 분은 먼저 보여주고, 상대 메시지는 typing 후 노출.
    const delayedIdSet = new Set(delayedOnes.map((m) => m.id));
    setDisplayedMessages(messages.filter((m) => !delayedIdSet.has(m.id)));
    setTypingFromName(delayedOnes[0].senderName);

    const timer = setTimeout(() => {
      setDisplayedMessages(messages);
      setTypingFromName(null);
      lastIdsRef.current = currentIds;
    }, 700);
    return () => clearTimeout(timer);
  }, [messages, me?.id]);
  // ──────────────────────────────────────────────────────────────────────

  // 새 announcement 가 도착하면 settlement 도 즉시 재조회 (members 상태 받아오기)
  useEffect(() => {
    if (!hasAnnouncement) return;
    const lastAnnouncementId =
      messages
        .filter((m) => m.kind === "announcement")
        .map((m) => m.id)
        .pop() ?? null;
    if (
      lastAnnouncementId &&
      lastSettlementRefetchRef.current !== lastAnnouncementId
    ) {
      lastSettlementRefetchRef.current = lastAnnouncementId;
      settlementQuery.refetch();
    }
  }, [hasAnnouncement, messages, settlementQuery]);

  // 스크롤 위치 추적 → bottom 근처에 있으면 sticky=true
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickyRef.current = distance < STICK_THRESHOLD_PX;
      if (stickyRef.current) setShowNewBadge(false);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // 새 메시지/typing 추가 시 sticky 면 bottom 으로, 아니면 badge
  useLayoutEffect(() => {
    if (!displayedMessages.length && !typingFromName) return;
    if (stickyRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      setShowNewBadge(true);
    }
  }, [displayedMessages.length, typingFromName]);

  const handleSend = (text: string) => {
    sendMutation.mutate({ kind: "text", text });
    // 본인 메시지 보냈으면 sticky 강제 true → 다음 layoutEffect 가 스크롤
    stickyRef.current = true;
  };

  const sendError =
    sendMutation.error instanceof ApiError
      ? sendMutation.error.message
      : sendMutation.error
        ? "메시지 전송에 실패했어요."
        : null;

  const renderItems = useMemo(() => {
    return displayedMessages.map((m, i) => {
      // announcement 메시지는 별도 GET /settlement 응답을 결합해 정산 카드로 렌더
      if (m.kind === "announcement") {
        if (!settlement) {
          // 정산 데이터 아직 도착 전 — 메시지 데이터로 임시 표시
          const fallback = pickSettlementFromMessage(m.data);
          return fallback ? (
            <SettlementNoticeCard
              key={m.id}
              roomId={roomId}
              settlement={{ ...fallback, createdAt: m.createdAt }}
              meId={me?.id ?? null}
              isHost={isHost}
            />
          ) : null;
        }
        return (
          <SettlementNoticeCard
            key={m.id}
            roomId={roomId}
            settlement={{ ...settlement, createdAt: m.createdAt }}
            meId={me?.id ?? null}
            isHost={isHost}
          />
        );
      }
      const prev = displayedMessages[i - 1];
      const showHeader =
        !prev ||
        prev.senderId !== m.senderId ||
        prev.kind === "system" ||
        m.kind === "system" ||
        // 5분 이상 차이나면 다시 헤더 노출
        new Date(m.createdAt).getTime() -
          new Date(prev.createdAt).getTime() >
          5 * 60_000;
      return (
        <MessageBubble
          key={m.id}
          message={m}
          meId={me?.id ?? null}
          showHeader={showHeader}
        />
      );
    });
  }, [displayedMessages, me?.id, isHost, roomId, settlement]);

  return (
    <div className="relative flex h-full w-full flex-col">
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3"
      >
        {messagesQuery.isLoading ? (
          <p className="py-10 text-center text-body-2 text-fg-tertiary">
            메시지 불러오는 중…
          </p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-body-2 text-fg-tertiary">
            아직 메시지가 없어요. 인사부터 보내볼까요?
          </p>
        ) : (
          <>
            {renderItems}
            {typingFromName && <TypingBubble name={typingFromName} />}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {showNewBadge && (
        <button
          type="button"
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setShowNewBadge(false);
          }}
          className="absolute bottom-[80px] left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-point-500 px-3.5 py-1.5 text-caption-1 font-bold text-fg-inverse shadow-md"
        >
          <ArrowDown className="size-3" /> 새 메시지
        </button>
      )}

      {sendError && (
        <p
          role="alert"
          className="mx-4 mb-2 rounded-sm bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
        >
          {sendError}
        </p>
      )}

      <MessageInput onSend={handleSend} disabled={sendMutation.isPending} />
    </div>
  );
}

/**
 * 상대방 새 메시지를 곧 표시한다는 "..." 인디케이터 — 실제 typing 이벤트가 아니라
 * 폴링 기반 렌더의 어색함을 가리는 시각적 트릭.
 */
function TypingBubble({ name }: { name: string }) {
  return (
    <div className="flex w-full items-start gap-2.5">
      <div className="size-9 shrink-0" />
      <div className="flex max-w-[78%] flex-col gap-1">
        <p className="px-1 text-caption-1 font-bold text-fg-point">{name}</p>
        <div className="flex items-center gap-1 rounded-bl-md rounded-br-2xl rounded-tl-2xl rounded-tr-2xl bg-bg-normal px-3.5 py-3.5 shadow-sm">
          <span className="size-1.5 animate-bounce rounded-full bg-fg-tertiary [animation-delay:-200ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-fg-tertiary [animation-delay:-100ms]" />
          <span className="size-1.5 animate-bounce rounded-full bg-fg-tertiary" />
        </div>
      </div>
    </div>
  );
}

/**
 * announcement 메시지의 data 필드(문자열 숫자) 로 만든 임시 settlement.
 * 실제 members/status 는 GET /settlement 응답으로만 받을 수 있음.
 */
function pickSettlementFromMessage(
  d: Record<string, unknown> | null,
): {
  totalFare: number;
  perPersonAmount: number;
  membersCount: number;
  imageUrl: string | null;
} | null {
  if (!d || typeof d !== "object") return null;
  const total = Number(d.totalFare ?? 0);
  const per = Number(d.perPersonAmount ?? 0);
  if (!total && !per) return null;
  return {
    totalFare: total,
    perPersonAmount: per,
    membersCount: Number(d.membersCount ?? 0),
    imageUrl: d.imageUrl != null ? String(d.imageUrl) : null,
  };
}
