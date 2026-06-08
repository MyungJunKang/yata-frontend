"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { Clock, Crown, MapPin, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type { ActiveRoom } from "@/features/rooms/api/room.types";

const ANIM_MS = 340;
// 살짝 무겁고 부드러운 ease-out — 아이폰 시트와 비슷한 느낌.
const SHEET_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";
// 드래그 거리(px) 가 이 값을 넘으면 닫힘으로 확정. 미만이면 원위치 스냅.
const DRAG_CLOSE_THRESHOLD_PX = 110;

const CALL_STATUS: Record<
  string,
  { label: string; tone: "pending" | "active" | "done" }
> = {
  pending: { label: "택시 호출 대기 중", tone: "pending" },
  calling: { label: "택시 호출 중", tone: "active" },
  called: { label: "택시 호출 완료", tone: "active" },
  settling: { label: "정산 진행 중", tone: "active" },
  completed: { label: "이용 완료", tone: "done" },
};

type Props = {
  open: boolean;
  room: ActiveRoom;
  meId: string | null;
  onClose: () => void;
};

export function RoomInfoSheet({ open, room, meId, onClose }: Props) {
  const [render, setRender] = useState(open);
  const [active, setActive] = useState(false);
  // 드래그 상태 — 사용자가 시트를 잡고 아래로 끄는 중일 때 픽셀 거리.
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const sheetHeightRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      setRender(true);
      setDragY(0);
      setActive(false);
      // double rAF — 첫 paint 가 translateY(100%) 로 commit 된 뒤 active=true 로 올려
      // 브라우저가 두 값 사이의 transition 을 확실히 잡도록 함.
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setActive(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        if (inner) cancelAnimationFrame(inner);
      };
    }
    setActive(false);
    const t = window.setTimeout(() => setRender(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [render, onClose]);

  if (!render) return null;

  const status = CALL_STATUS[room.callStatus] ?? {
    label: "—",
    tone: "pending" as const,
  };

  const handleDragPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // 시트 본문 안쪽 컨트롤(닫기 X 버튼 등) 의 click 을 방해하지 않도록 좌클릭/터치만 시작.
    if (e.button !== 0 && e.pointerType === "mouse") return;
    startYRef.current = e.clientY;
    sheetHeightRef.current = e.currentTarget
      .closest("[data-sheet-root]")
      ?.getBoundingClientRect().height ?? window.innerHeight;
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handleDragPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;
    // 위로는 끌어올릴 수 없게 0 으로 클램프, 너무 멀리도 sheetHeight 이내로 제한.
    const clamped = Math.max(0, Math.min(delta, sheetHeightRef.current));
    setDragY(clamped);
  };

  const handleDragPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (startYRef.current === null) return;
    const delta = e.clientY - startYRef.current;
    startYRef.current = null;
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // 포인터 캡처가 이미 해제됐을 수 있음 — 무시.
    }
    if (delta > DRAG_CLOSE_THRESHOLD_PX) {
      // 닫기 확정 — onClose 가 부모의 open=false 로 전환하면서 슬라이드 다운.
      onClose();
    } else {
      // 임계 미만이면 제자리로 스냅.
      setDragY(0);
    }
  };

  // 시트 본체 transform — 닫혀가는 중엔 translateY(100%), 열려있고 드래그 중이면 dragY,
  // 그 외엔 0. transition 은 드래그 중에만 끄고 나머지는 켜둠.
  const sheetTransform = active
    ? `translateY(${dragY}px)`
    : "translateY(100%)";
  const sheetStyle: CSSProperties = {
    transform: sheetTransform,
    transition: isDragging
      ? "none"
      : `transform ${ANIM_MS}ms ${SHEET_EASING}`,
  };
  // 백드롭 — 드래그 거리에 비례해 살짝 옅어지며 시각적 피드백.
  const backdropOpacity = active
    ? Math.max(0, 1 - dragY / (sheetHeightRef.current || 600))
    : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-info-title"
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        style={{
          opacity: backdropOpacity,
          transition: isDragging
            ? "none"
            : `opacity ${ANIM_MS}ms ${SHEET_EASING}`,
        }}
        className="absolute inset-0 cursor-default bg-black/50"
      />
      <div
        data-sheet-root
        style={sheetStyle}
        className={cn(
          "relative z-10 flex max-h-[80dvh] w-full max-w-screen-sm flex-col overflow-hidden rounded-t-3xl bg-bg-normal shadow-2xl will-change-transform",
        )}
      >
        {/* Drag-grab area — 핸들 + 헤더를 통째로 잡아 끌 수 있음 */}
        <div
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerUp}
          onPointerCancel={handleDragPointerUp}
          className="cursor-grab touch-none select-none active:cursor-grabbing"
        >
          {/* Drag handle */}
          <div className="flex w-full justify-center pt-3">
            <span className="h-1.5 w-10 rounded-full bg-stroke-normal" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3">
            <h2
              id="room-info-title"
              className="text-strong-1 text-fg-primary"
            >
              방 정보
            </h2>
            {/* X 버튼 — 드래그 영역 안이지만 onPointerDown stopPropagation 으로 click 보장 */}
            <button
              type="button"
              onClick={onClose}
              onPointerDown={(e) => e.stopPropagation()}
              aria-label="닫기"
              className="flex size-8 items-center justify-center rounded-full text-fg-tertiary hover:bg-bg-subtle hover:text-fg-primary"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-1">
          {/* 경로 — 출발지 → 도착지 */}
          <div className="flex flex-col gap-1">
            <p className="text-caption-1 font-bold uppercase tracking-wider text-fg-tertiary">
              경로
            </p>
            <p className="text-title-3 font-bold text-fg-primary">
              {room.startPoint} → {room.endPoint}
            </p>
          </div>

          {/* 호출 상태 */}
          <StatusCard label={status.label} tone={status.tone} />

          {/* 경로 + 시간 */}
          <div className="flex flex-col gap-3 rounded-2xl bg-bg-subtle p-4">
            <RouteRow label="출발" value={room.startPoint} dot="bg-point-500" />
            <div className="ml-1 h-3 w-px bg-stroke-normal" aria-hidden />
            <RouteRow label="도착" value={room.endPoint} dot="bg-point-300" />
            <div className="flex items-center gap-2 border-t border-stroke-thin pt-3 text-caption-1 text-fg-tertiary">
              <Clock className="size-3.5" />
              출발 시각 · {formatDepartAt(room.departAt)}
            </div>
          </div>

          {/* 멤버 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <p className="text-caption-1 font-bold uppercase tracking-wider text-fg-tertiary">
                탑승 멤버
              </p>
              <p className="text-caption-1 font-bold text-fg-point">
                {room.joinedCount} / {room.maxCount}명
              </p>
            </div>
            <ul className="flex flex-col gap-1">
              {room.members.map((m) => {
                const isMe = meId === m.userId;
                return (
                  <li
                    key={m.userId}
                    className="flex items-center gap-3 rounded-xl bg-bg-subtle px-3 py-2.5"
                  >
                    <MemberAvatar
                      name={m.name}
                      url={m.avatarUrl}
                      isHost={m.role === "host"}
                    />
                    <div className="flex min-w-0 flex-1 flex-col leading-tight">
                      <span className="truncate text-body-2 font-bold text-fg-primary">
                        {m.name}
                        {isMe && (
                          <span className="ml-1.5 text-caption-1 font-medium text-fg-tertiary">
                            (나)
                          </span>
                        )}
                      </span>
                      <span className="text-caption-1 text-fg-tertiary">
                        {m.role === "host" ? "호스트" : "멤버"}
                      </span>
                    </div>
                    {m.role === "host" && (
                      <span className="flex size-7 items-center justify-center rounded-full bg-point-100 text-fg-point">
                        <Crown className="size-3.5" />
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusCard({
  label,
  tone,
}: {
  label: string;
  tone: "pending" | "active" | "done";
}) {
  const palette = {
    pending: "bg-status-pending-bg text-status-pending-strong",
    active: "bg-point-100 text-point-700",
    done: "bg-bg-subtle text-fg-secondary",
  } as const;
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-4 py-3",
        palette[tone],
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full",
          tone === "pending"
            ? "bg-status-pending-strong/15"
            : tone === "active"
              ? "bg-point-200/60"
              : "bg-stroke-thin",
        )}
      >
        <MapPin className="size-4" />
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-caption-1 font-bold uppercase tracking-wider opacity-70">
          호출 현황
        </span>
        <span className="text-body-2 font-bold">{label}</span>
      </div>
    </div>
  );
}

function RouteRow({
  label,
  value,
  dot,
}: {
  label: string;
  value: string;
  dot: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", dot)} />
      <div className="flex min-w-0 flex-1 flex-col leading-tight">
        <span className="text-caption-1 text-fg-tertiary">{label}</span>
        <span className="truncate text-body-1 font-bold text-fg-primary">
          {value}
        </span>
      </div>
    </div>
  );
}

function MemberAvatar({
  name,
  url,
  isHost,
}: {
  name: string;
  url: string | null;
  isHost: boolean;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="size-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className={cn(
        "flex size-10 items-center justify-center rounded-full text-strong-2 text-fg-inverse",
        isHost ? "bg-point-500" : "bg-point-300",
      )}
    >
      {name.slice(0, 1) || "?"}
    </div>
  );
}
