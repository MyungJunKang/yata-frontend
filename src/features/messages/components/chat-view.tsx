"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ArrowDown } from "lucide-react";

import { ApiError } from "@/lib/api-client";
import {
  useMessagesQuery,
  useSendMessageMutation,
} from "@/features/messages/api/use-messages";
import type { UserType } from "@/features/user/api/user.types";
import { MessageBubble } from "@/features/messages/components/message-bubble";
import { MessageInput } from "@/features/messages/components/message-input";

type Props = {
  roomId: string;
  me: UserType | undefined;
};

const STICK_THRESHOLD_PX = 80;

export function ChatView({ roomId, me }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef(true);
  const [showNewBadge, setShowNewBadge] = useState(false);

  const messagesQuery = useMessagesQuery(roomId);
  const sendMutation = useSendMessageMutation(roomId, me);

  // image 종류는 아직 미지원 — 표시 자체를 안 함
  const messages = useMemo(
    () => (messagesQuery.data ?? []).filter((m) => m.kind !== "image"),
    [messagesQuery.data],
  );

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

  // 새 메시지 추가 시 sticky 면 bottom 으로, 아니면 badge
  useLayoutEffect(() => {
    if (!messages.length) return;
    if (stickyRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    } else {
      setShowNewBadge(true);
    }
  }, [messages.length]);

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
    return messages.map((m, i) => {
      const prev = messages[i - 1];
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
  }, [messages, me?.id]);

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
          renderItems
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
