import { BadgeCheck, CarFront, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type { RoomType } from "@/features/rooms/api/room.types";

export function RoomCard({ room }: { room: RoomType }) {
  const isFull = room.joinedCount >= room.maxCount;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-bg-normal p-4 shadow-sm transition-opacity",
        isFull && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-point-50 text-[10px] font-medium text-fg-point">
          <CarFront className="size-5" />
          <span className="mt-0.5">호출전</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-caption-1 font-bold text-fg-point">
            <span className="size-1.5 rounded-full bg-point-500" />
            인증된 방
            <BadgeCheck className="size-3.5" />
          </span>
          <p className="truncate text-subtitle text-fg-primary">
            {room.host.name}님의 방
          </p>
          <div className="mt-1 flex items-center gap-3 text-caption-1 text-fg-tertiary">
            <div className="flex items-center gap-2">
              <Avatars count={room.joinedCount} />
              <span>
                {room.joinedCount} / {room.maxCount}명
              </span>
            </div>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDepartAt(room.departAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-stroke-thin pt-3">
        <div className="flex flex-col">
          <span className="text-caption-1 text-fg-tertiary">예상 요금</span>
          <span className="text-title-3 font-bold text-fg-primary">
            {room.perPersonFare === null
              ? "산정 중"
              : `₩${room.perPersonFare.toLocaleString()}`}{" "}
            <span className="text-body-2 font-medium text-fg-secondary">
              / 1인
            </span>
          </span>
        </div>
        <button
          type="button"
          disabled={isFull}
          className={cn(
            "h-10 rounded-md px-4 text-strong-2 transition-colors",
            isFull
              ? "bg-point-100 text-fg-point opacity-70"
              : "bg-point-500 text-fg-inverse hover:bg-point-600",
          )}
        >
          방 참여하기
        </button>
      </div>
    </article>
  );
}

function Avatars({ count }: { count: number }) {
  const colors = ["#FFB8B8", "#A893FF", "#86EFAC", "#FFD75A"];
  const dots = Array.from({ length: Math.min(count, colors.length) });
  return (
    <div className="flex -space-x-1.5">
      {dots.map((_, i) => (
        <span
          key={i}
          className="size-4 rounded-full border-2 border-bg-normal"
          style={{ backgroundColor: colors[i] }}
          aria-hidden
        />
      ))}
    </div>
  );
}
