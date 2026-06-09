"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BadgeCheck, CarFront, Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertDialog } from "@/components/ui/alert-dialog";
import { formatDepartAt } from "@/features/rooms/lib/format";
import type { RoomCallStatus, RoomType } from "@/features/rooms/api/room.types";
import { useJoinRoomMutation } from "@/features/rooms/api/use-room-actions";
import { useUserQuery } from "@/features/user/api/use-user";
import { ApiError } from "@/lib/api-client";

type Props = {
  room: RoomType;
  /** 이미 다른 방에 참여 중일 때 카드 전체를 잠금 */
  isLocked?: boolean;
};

// pending 이 아닌 경우 카드의 참여 버튼에 표시할 라벨. 모집이 마감된 상태.
const NON_JOINABLE_LABEL: Record<Exclude<RoomCallStatus, "pending">, string> = {
  calling: "호출 중",
  called: "호출 완료",
  settling: "정산 중",
  completed: "이용 완료",
};

export function RoomCard({ room, isLocked = false }: Props) {
  const router = useRouter();
  const userQuery = useUserQuery();
  const me = userQuery.data;
  const [lockAlertOpen, setLockAlertOpen] = useState(false);
  const isMine =
    !!me &&
    (me.id === room.host.userId || me.activeRoomId === room.id);
  const isFull = room.joinedCount >= room.maxCount;
  // pending 상태에서만 모집 중 — 그 외(calling/called/settling/completed)는 참여 불가.
  const isJoinable = room.status === "pending";
  const nonJoinableLabel =
    room.status !== "pending" ? NON_JOINABLE_LABEL[room.status] : null;
  const joinMutation = useJoinRoomMutation();
  // 잠금(다른 활성 방 참여 중)은 버튼 비활성화 대신 안내 다이얼로그로 처리.
  // 마감(isFull) 또는 모집 종료(!isJoinable)는 버튼 비활성화 대상.
  const locked = !isMine && isLocked;
  const isDisabled = !isMine && (isFull || !isJoinable);

  const handleEnter = () => {
    if (isMine) {
      router.push(`/room/${room.id}`);
      return;
    }
    // 다른 방에 참여 중이면 안내 다이얼로그를 띄운다.
    if (locked) {
      setLockAlertOpen(true);
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
        "flex flex-col gap-3.5 rounded-lg bg-bg-normal p-[18px] shadow-lg transition-opacity",
        (isFull || !isJoinable) && !isMine && "opacity-70",
        isLocked && !isMine && "opacity-50",
        isMine && "ring-1 ring-stroke-point",
      )}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 flex-col items-center justify-center gap-1 rounded-lg bg-gray-100 text-[10px] font-bold text-fg-tertiary">
          <CarFront className="size-5 text-fg-secondary" />
          <span className="leading-none">
            {isJoinable ? "호출전" : (nonJoinableLabel ?? "호출전")}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <span className="inline-flex items-center gap-1 text-[12px] font-bold text-fg-point">
            인증된 방
            <BadgeCheck className="size-3.5" />
          </span>
          <p className="truncate text-subtitle text-fg-primary">
            {room.host.name}님의 방
          </p>
          {(room.startPoint || room.endPoint) && (
            <p className="flex min-w-0 items-center gap-1 truncate text-[12px] font-medium text-fg-secondary">
              <span className="truncate">{room.startPoint ?? "—"}</span>
              <ArrowRight className="size-3 shrink-0 text-fg-tertiary" />
              <span className="truncate">{room.endPoint ?? "—"}</span>
            </p>
          )}
          {room.message && room.message.trim() && (
            <p className="truncate border-l-2 border-stroke-thin pl-2 text-[12px] italic text-fg-secondary">
              “{room.message.trim()}”
            </p>
          )}
          <div className="flex items-center justify-between text-[12px] font-bold text-fg-tertiary">
            <Avatars count={room.joinedCount} />
            <span className="tabular">
              {room.joinedCount} / {room.maxCount}명
            </span>
            <span className="inline-flex items-center gap-1 tabular">
              <Clock className="size-3.5" />
              {formatDepartAt(room.departAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-stroke-thin" />

      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-eyebrow text-fg-tertiary">
            예상 요금
          </span>
          <span className="flex items-baseline gap-1 text-title-3 text-fg-primary tabular">
            {room.perPersonFare === null
              ? "산정 중"
              : `₩${room.perPersonFare.toLocaleString()}`}
            <span className="text-body-2 text-fg-secondary">/ 1인</span>
          </span>
        </div>
        <Button
          variant={
            isMine ? "point" : isDisabled || locked ? "point-soft" : "point"
          }
          size="md"
          onClick={handleEnter}
          disabled={!isMine && (isDisabled || joinMutation.isPending)}
        >
          {isMine
            ? "방으로 이동"
            : isFull
              ? "마감"
              : nonJoinableLabel
                ? nonJoinableLabel
                : joinMutation.isPending
                  ? "참여 중…"
                  : "방 참여하기"}
        </Button>
      </div>

      {errorMessage && (
        <p
          role="alert"
          className="rounded-lg bg-red-100 px-3 py-2 text-caption-1 text-fg-warning"
        >
          {errorMessage}
        </p>
      )}

      <AlertDialog
        open={lockAlertOpen}
        title="참여할 수 없어요"
        description="기존 매칭이 끝나야 참여 가능합니다."
        onClose={() => setLockAlertOpen(false)}
      />
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
