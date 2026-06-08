"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Info,
  LogOut,
  Receipt,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SplashLoader } from "@/components/ui/splash-loader";
import { useActiveRoomQuery, useUserQuery } from "@/features/user/api/use-user";
import {
  useArchiveRoomMutation,
  useLeaveRoomMutation,
} from "@/features/rooms/api/use-room-actions";
import { useRoomDetailQuery } from "@/features/rooms/api/use-rooms";
import { ChatView } from "@/features/messages/components/chat-view";
import { RoomActionCard } from "@/features/rooms/components/room-action-card";
import { RoomInfoSheet } from "@/features/rooms/components/room-info-sheet";
import type { ActiveRoom } from "@/features/rooms/api/room.types";

type Props = {
  roomId: string;
};

export function RoomDetailScreen({ roomId }: Props) {
  const router = useRouter();
  const userQuery = useUserQuery();
  const activeRoomQuery = useActiveRoomQuery();
  const detailQuery = useRoomDetailQuery(roomId);
  const leaveMutation = useLeaveRoomMutation();
  const archiveMutation = useArchiveRoomMutation();

  // 우선순위: 본인 active room (멤버일 때) > 단건 조회 (참여 안 했지만 정보 보기)
  const activeRoom = activeRoomQuery.data?.room ?? null;
  const isMyActiveRoom = !!(activeRoom && activeRoom.id === roomId);
  const room: ActiveRoom | null = isMyActiveRoom
    ? activeRoom
    : (detailQuery.data ?? null);

  const me = userQuery.data;
  const isHost = !!(me && room && room.members.some(
    (m) => m.userId === me.id && m.role === "host",
  ));
  const isMember = !!(me && room && room.members.some(
    (m) => m.userId === me.id,
  ));
  const exitMutation = isHost ? archiveMutation : leaveMutation;

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  // 방 종료 자동 이탈 — active-room 조회 응답의 room 이 null 이면 종료된 것으로 간주.
  // 단, 멤버였던 적이 있는 사용자만 redirect (비멤버 단순 조회는 영향 없음).
  const [wasMember, setWasMember] = useState(false);
  useEffect(() => {
    if (activeRoomQuery.isLoading) return;
    const active = activeRoomQuery.data?.room ?? null;
    if (active && active.id === roomId) {
      if (!wasMember) setWasMember(true);
      return;
    }
    // room === null (또는 다른 방으로 바뀜) + 이전에 멤버였음 → 종료된 것.
    if (wasMember) router.replace("/home");
  }, [
    activeRoomQuery.isLoading,
    activeRoomQuery.data,
    roomId,
    router,
    wasMember,
  ]);

  const handleExitClick = () => {
    if (exitMutation.isPending) return;
    setConfirmOpen(true);
  };
  const handleConfirmExit = () => {
    exitMutation.mutate(roomId, {
      onSuccess: () => {
        setConfirmOpen(false);
        router.replace("/home");
      },
      onError: () => setConfirmOpen(false),
    });
  };

  // 로딩
  if (activeRoomQuery.isLoading || detailQuery.isLoading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-bg-page">
        <SplashLoader label="방 정보를 불러오는 중…" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
        <SimpleAppBar onBack={() => router.back()} title="방" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-strong-1 text-fg-primary">
            방 정보를 찾을 수 없어요.
          </p>
          <p className="text-body-2 text-fg-secondary">
            만료되었거나 삭제된 방일 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className="mt-2 h-11 rounded-md bg-point-500 px-5 text-strong-2 text-fg-inverse hover:bg-point-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const exitError =
    exitMutation.error instanceof ApiError
      ? exitMutation.error.message
      : exitMutation.error
        ? isHost
          ? "방 종료에 실패했어요."
          : "방 나가기에 실패했어요."
        : null;

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      {/* App Bar */}
      <header className="flex h-14 w-full shrink-0 items-center gap-1 border-b border-stroke-thin bg-bg-normal px-2">
        <IconButton
          onClick={() => router.back()}
          ariaLabel="뒤로가기"
        >
          <ChevronLeft className="size-5" />
        </IconButton>
        <div className="flex min-w-0 flex-1 flex-col leading-tight">
          <p className="truncate text-strong-2 text-fg-primary">
            {room.title || `${room.startPoint} → ${room.endPoint}`}
          </p>
          <p className="truncate text-[11px] font-bold text-fg-tertiary">
            {room.startPoint} → {room.endPoint}
          </p>
        </div>
        <IconButton onClick={() => setInfoOpen(true)} ariaLabel="방 정보">
          <Info className="size-5" />
        </IconButton>
        {isHost && (
          <IconButton
            onClick={() => router.push(`/room/${roomId}/settlement`)}
            ariaLabel="정산"
            tone="point"
          >
            <Receipt className="size-5" />
          </IconButton>
        )}
        {isMember && (
          <IconButton
            onClick={handleExitClick}
            ariaLabel={isHost ? "방 종료" : "방 나가기"}
            tone="danger"
            disabled={exitMutation.isPending}
          >
            <LogOut className="size-5" />
          </IconButton>
        )}
      </header>

      {/* 택시 호출 액션 카드 (멤버 전용) */}
      {isMember && (
        <div className="shrink-0 px-4 py-3">
          <RoomActionCard
            roomId={roomId}
            callStatus={room.callStatus}
            isHost={isHost}
            onOpenMembers={() => setInfoOpen(true)}
          />
        </div>
      )}

      {exitError && (
        <p
          role="alert"
          className="mx-4 mt-2 shrink-0 rounded-lg bg-red-100 px-3 py-2 text-caption-1 font-medium text-fg-warning"
        >
          {exitError}
        </p>
      )}

      {/* 멤버가 아니면 채팅 대신 안내 */}
      {!isMember ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-strong-1 text-fg-primary">
            이 방에 참여하지 않으셨어요.
          </p>
          <p className="text-body-2 text-fg-secondary">
            홈에서 방에 참여해야 채팅을 볼 수 있어요.
          </p>
          <button
            type="button"
            onClick={() => router.replace("/home")}
            className="mt-2 h-11 rounded-md bg-point-500 px-5 text-strong-2 text-fg-inverse hover:bg-point-600"
          >
            홈으로 돌아가기
          </button>
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col">
          <ChatView
            roomId={room.id}
            me={me}
            isHost={isHost}
            callStatus={room.callStatus}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={isHost ? "방을 종료할까요?" : "방에서 나갈까요?"}
        description={
          isHost
            ? "모든 멤버가 함께 나가게 되며 채팅도 종료됩니다."
            : "다시 들어오려면 호스트의 새 초대가 필요할 수 있어요."
        }
        confirmLabel={isHost ? "방 종료" : "나가기"}
        cancelLabel="취소"
        variant="danger"
        pending={exitMutation.isPending}
        onConfirm={handleConfirmExit}
        onCancel={() => {
          if (exitMutation.isPending) return;
          setConfirmOpen(false);
        }}
      />

      <RoomInfoSheet
        open={infoOpen}
        room={room}
        meId={me?.id ?? null}
        onClose={() => setInfoOpen(false)}
      />
    </div>
  );
}

function IconButton({
  children,
  onClick,
  ariaLabel,
  disabled,
  tone = "neutral",
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  disabled?: boolean;
  tone?: "neutral" | "point" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-50",
        tone === "neutral" &&
          "text-fg-secondary hover:bg-bg-subtle hover:text-fg-primary",
        tone === "point" && "text-fg-point hover:bg-point-50",
        tone === "danger" &&
          "text-fg-tertiary hover:bg-bg-subtle hover:text-fg-warning",
      )}
    >
      {children}
    </button>
  );
}

function SimpleAppBar({
  title,
  onBack,
}: {
  title: string;
  onBack: () => void;
}) {
  return (
    <div className="flex h-14 w-full items-center gap-1 border-b border-stroke-thin bg-bg-normal px-2">
      <IconButton onClick={onBack} ariaLabel="뒤로가기">
        <ChevronLeft className="size-5" />
      </IconButton>
      <p className="truncate text-strong-2 text-fg-primary">{title}</p>
    </div>
  );
}
