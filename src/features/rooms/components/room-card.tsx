import { BadgeCheck, CarFront, Clock, Lock } from "lucide-react";

import { cn } from "@/lib/utils";
import type { RoomSummary } from "@/features/home/lib/mock-data";

const STATUS_LABEL: Record<RoomSummary["callStatus"], string> = {
  before: "호출전",
  completed: "호출완료",
  closed: "호출완료",
};

export function RoomCard({ room }: { room: RoomSummary }) {
  const isClosed = room.callStatus === "closed";

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-lg bg-bg-normal p-4 shadow-sm transition-opacity",
        isClosed && "opacity-70",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-12 shrink-0 flex-col items-center justify-center rounded-md bg-point-50 text-[10px] font-medium",
            isClosed ? "text-fg-tertiary" : "text-fg-point",
          )}
        >
          <CarFront className="size-5" />
          <span className="mt-0.5">{STATUS_LABEL[room.callStatus]}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center gap-2">
            {isClosed ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-700 px-2 py-0.5 text-[11px] font-bold text-fg-inverse">
                <Lock className="size-3" />
                마감
              </span>
            ) : (
              room.verified && (
                <span className="inline-flex items-center gap-1 text-caption-1 font-bold text-fg-point">
                  <span className="size-1.5 rounded-full bg-point-500" />
                  인증된 방
                  <BadgeCheck className="size-3.5" />
                </span>
              )
            )}
          </div>
          <p className="truncate text-subtitle text-fg-primary">
            {room.host}님의 방
          </p>
          <div className="mt-1 flex items-center gap-3 text-caption-1 text-fg-tertiary">
            <div className="flex items-center gap-2">
              <Avatars colors={room.memberColors} />
              <span>
                {room.members} / {room.capacity}명
              </span>
            </div>
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {room.departAt}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-stroke-thin pt-3">
        <div className="flex flex-col">
          <span className="text-caption-1 text-fg-tertiary">예상 요금</span>
          <span className="text-title-3 font-bold text-fg-primary">
            ₩{room.farePerPerson.toLocaleString()}{" "}
            <span className="text-body-2 font-medium text-fg-secondary">
              / 1인
            </span>
          </span>
        </div>
        <button
          type="button"
          disabled={isClosed}
          className={cn(
            "h-10 rounded-md px-4 text-strong-2 transition-colors",
            isClosed
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

function Avatars({ colors }: { colors: string[] }) {
  return (
    <div className="flex -space-x-1.5">
      {colors.map((c, i) => (
        <span
          key={i}
          className="size-4 rounded-full border-2 border-bg-normal"
          style={{ backgroundColor: c }}
          aria-hidden
        />
      ))}
    </div>
  );
}
