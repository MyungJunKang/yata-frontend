"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  archiveRoom,
  callTaxi,
  cancelCall,
  joinRoom,
  leaveRoom,
  shareLocation,
} from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import type { ShareLocationBody } from "@/features/rooms/api/room.types";
import { sendMessage } from "@/features/messages/api/messages";
import { messageKeys } from "@/features/messages/api/query-keys";
import { userKeys } from "@/features/user/api/query-keys";
import type { UserType } from "@/features/user/api/user.types";

export function useJoinRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => joinRoom(roomId),
    onSuccess: async (_data, roomId) => {
      // 참여하면 active-room 갱신 + 룸 리스트 stale
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      // 입장 알림을 채팅에 텍스트로 송출 — 호스트/다른 멤버가 채팅에서 확인.
      const me = qc.getQueryData<UserType>(userKeys.me());
      const name = me?.name ?? "멤버";
      try {
        await sendMessage(roomId, {
          kind: "text",
          text: `🙋 ${name}님이 방에 들어왔어요`,
        });
      } catch {
        /* noop — 알림 실패는 입장 자체를 막지 않음 */
      }
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}

export function useLeaveRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    // 멤버가 방을 떠나기 전에 채팅 알림을 먼저 보낸다 — leaveRoom 이 통과되면
    // 더 이상 멤버가 아니라 메시지를 못 보낼 수 있어서 순서가 중요.
    mutationFn: async (roomId: string) => {
      const me = qc.getQueryData<UserType>(userKeys.me());
      const name = me?.name ?? "멤버";
      try {
        await sendMessage(roomId, {
          kind: "text",
          text: `🚪 ${name}님이 방을 나갔어요`,
        });
      } catch {
        /* noop */
      }
      return leaveRoom(roomId);
    },
    onSuccess: (_data, roomId) => {
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}

/** 호스트 전용 — 방 종료. */
export function useArchiveRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => archiveRoom(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

/** 택시 호출 — 방 상세는 active-room + detail 둘 다 읽으므로 모두 무효화. */
export function useCallTaxiMutation(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => callTaxi(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** 택시 호출 취소. */
export function useCancelCallMutation(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelCall(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.detail(roomId) });
    },
  });
}

/** 실시간 위치 1회 공유 — 캐시 무효화 불필요. */
export function useShareLocationMutation(roomId: string) {
  return useMutation({
    mutationFn: (body: ShareLocationBody) => shareLocation(roomId, body),
  });
}
