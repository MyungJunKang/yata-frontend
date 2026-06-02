"use client";

import { useEffect, useState } from "react";
import { Clock, Crown, MapPin, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type { ActiveRoom } from "@/features/rooms/api/room.types";

const ANIM_MS = 240;

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

  useEffect(() => {
    if (open) {
      setRender(true);
      const id = requestAnimationFrame(() => setActive(true));
      return () => cancelAnimationFrame(id);
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
        className={cn(
          "absolute inset-0 cursor-default bg-black/50 transition-opacity duration-200 ease-out",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative z-10 flex max-h-[80dvh] w-full max-w-screen-sm flex-col overflow-hidden rounded-t-3xl bg-bg-normal shadow-2xl",
          "transition-transform duration-200 ease-out will-change-transform",
          active ? "translate-y-0" : "translate-y-full",
        )}
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
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-8 items-center justify-center rounded-full text-fg-tertiary hover:bg-bg-subtle hover:text-fg-primary"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex flex-col gap-4 overflow-y-auto px-5 pb-6 pt-1">
          {/* Title */}
          <div className="flex flex-col gap-1">
            <p className="text-caption-1 font-bold uppercase tracking-wider text-fg-tertiary">
              방 제목
            </p>
            <p className="text-title-3 font-bold text-fg-primary">
              {room.title || `${room.startPoint} → ${room.endPoint}`}
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
