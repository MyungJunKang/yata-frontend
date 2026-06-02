"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { archiveRoom, joinRoom, leaveRoom } from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import { userKeys } from "@/features/user/api/query-keys";

export function useJoinRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => joinRoom(roomId),
    onSuccess: () => {
      // 참여하면 active-room 갱신 + 룸 리스트 stale
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
    },
  });
}

export function useLeaveRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => leaveRoom(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.activeRoom() });
      qc.invalidateQueries({ queryKey: roomKeys.lists() });
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
