"use client";

import Link from "next/link";
import { ChevronRight, Car } from "lucide-react";

import type { ActiveRoom } from "@/features/rooms/api/room.types";

const CALL_STATUS_SUFFIX: Record<string, string> = {
  pending: "택시 호출 대기 중",
  calling: "택시 호출 중",
  called: "택시 호출 완료",
  settling: "정산 진행 중",
  completed: "이용 완료",
};

type Props = {
  room: ActiveRoom;
};

export function ActiveRoomBanner({ room }: Props) {
  const status = CALL_STATUS_SUFFIX[room.callStatus] ?? "진행 중";
  return (
    <Link
      href={`/room/${room.id}`}
      className="tap-spring flex w-full items-center gap-3 rounded-3xl bg-point-400 px-4 py-3.5 shadow-[0_8px_20px_0_rgba(112,72,255,0.28)]"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-point-300">
        <Car className="size-5 text-fg-inverse" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-fg-inverse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-fg-inverse">
            참여 중인 방
          </span>
        </div>
        <p className="truncate text-[15px] font-bold text-point-700">
          {room.title || `${room.startPoint} → ${room.endPoint}`}
        </p>
        <p className="truncate text-[11px] font-bold text-point-800">
          {room.joinedCount} / {room.maxCount}명 · {status}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-bg-normal/90 px-3 py-2 text-caption-1 font-bold text-point-700">
        돌아가기
        <ChevronRight className="size-3" />
      </div>
    </Link>
  );
}
