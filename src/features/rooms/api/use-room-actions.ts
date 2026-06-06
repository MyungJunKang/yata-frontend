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
