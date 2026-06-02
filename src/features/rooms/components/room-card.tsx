"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, CarFront, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type { RoomType } from "@/features/rooms/api/room.types";
import { useJoinRoomMutation } from "@/features/rooms/api/use-room-actions";
import { useUserQuery } from "@/features/user/api/use-user";
import { ApiError } from "@/lib/api-client";

type Props = {
  room: RoomType;
  /** 이미 다른 방에 참여 중일 때 카드 전체를 잠금 */
  isLocked?: boolean;
};

export function RoomCard({ room, isLocked = false }: Props) {
  const router = useRouter();
  const userQuery = useUserQuery();
  const me = userQuery.data;
  const isMine =
    !!me &&
    (me.id === room.host.userId || me.activeRoomId === room.id);
  const isFull = room.joinedCount >= room.maxCount;
  const joinMutation = useJoinRoomMutation();
  // 본인 방이면 join 시도 X, lock 도 무시 (바로 진입 가능)
  const isDisabled = !isMine && (isLocked || isFull);

  const handleEnter = () => {
    if (isMine) {
      router.push(`/room/${room.id}`);
      return;
    }
    if (isDisabled || joinMutation.isPending) return;
    joinMutation.mutate(room.id, {
      onSuccess: () => router.push(`/room/${room.id}`),
    });
  };

  const errorMessage =
    joinMutation.error instanceof ApiError
      ? joinMutation.error.message
      : joinMutation.error
        ? "참여에 실패했어요."
        : null;

  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-bg-normal p-4 shadow-sm transition-opacity",
        isFull && !isMine && "opacity-70",
        isLocked && !isMine && "opacity-50",
        isMine && "ring-1 ring-stroke-point",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-12 shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl bg-point-50 text-[10px] font-medium text-fg-point">
          <CarFront className="size-5" />
          <span className="leading-none">호출전</span>
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
              <span className="tabular">
                {room.joinedCount} / {room.maxCount}명
              </span>
            </div>
            <span className="inline-flex items-center gap-1 tabular">
              <Clock className="size-3.5" />
              {formatDepartAt(room.departAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-stroke-thin pt-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-caption-1 text-fg-tertiary">예상 요금</span>
          <span className="flex items-baseline gap-1 text-title-3 font-bold text-fg-primary tabular">
            {room.perPersonFare === null
              ? "산정 중"
              : `₩${room.perPersonFare.toLocaleString()}`}
            <span className="text-body-2 font-medium text-fg-secondary">
              / 1인
            </span>
          </span>
        </div>
        <Button
          variant={isMine ? "point" : isDisabled ? "point-soft" : "point"}
          size="md"
          onClick={handleEnter}
          disabled={!isMine && (isDisabled || joinMutation.isPending)}
        >
          {isMine
            ? "방으로 이동"
            : joinMutation.isPending
              ? "참여 중…"
              : "방 참여하기"}
        </Button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
        >
          {errorMessage}
        </p>
      )}
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
