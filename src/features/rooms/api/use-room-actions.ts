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
import type {
  ActiveRoom,
  CallStatusResponse,
  GetActiveRoomResponse,
  RoomType,
  ShareLocationBody,
} from "@/features/rooms/api/room.types";
import { sendMessage } from "@/features/messages/api/messages";
import { messageKeys } from "@/features/messages/api/query-keys";
import { userKeys } from "@/features/user/api/query-keys";
import type { UserType } from "@/features/user/api/user.types";

/** 목록 캐시의 특정 방 joinedCount 를 증감 — 모든 list variant 에 동시 반영. */
function patchRoomListJoinedCount(
  qc: ReturnType<typeof useQueryClient>,
  roomId: string,
  delta: number,
) {
  qc.setQueriesData<RoomType[]>({ queryKey: roomKeys.lists() }, (prev) => {
    if (!prev) return prev;
    return prev.map((r) =>
      r.id === roomId
        ? { ...r, joinedCount: Math.max(0, r.joinedCount + delta) }
        : r,
    );
  });
}

/** activeRoom 캐시를 즉시 변경 — 동일 roomId 일 때만 적용. */
function patchActiveRoom(
  qc: ReturnType<typeof useQueryClient>,
  roomId: string,
  patch: Partial<ActiveRoom> | null,
) {
  qc.setQueryData<GetActiveRoomResponse>(userKeys.activeRoom(), (prev) => {
    if (!prev?.room || prev.room.id !== roomId) return prev;
    if (patch === null) return { ...prev, room: null };
    return { ...prev, room: { ...prev.room, ...patch } };
  });
}

/** 방 상세 캐시를 즉시 변경. */
function patchRoomDetail(
  qc: ReturnType<typeof useQueryClient>,
  roomId: string,
  patch: Partial<ActiveRoom>,
) {
  qc.setQueryData<ActiveRoom>(roomKeys.detail(roomId), (prev) => {
    if (!prev) return prev;
    return { ...prev, ...patch };
  });
}

export function useJoinRoomMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => joinRoom(roomId),
    // 목록의 joinedCount 를 즉시 +1 — 다른 사용자 액션 폴링과 충돌해도 onSettled 에서 보정.
    onMutate: async (roomId) => {
      await qc.cancelQueries({ queryKey: roomKeys.lists() });
      const snapshot = qc.getQueriesData<RoomType[]>({
        queryKey: roomKeys.lists(),
      });
      patchRoomListJoinedCount(qc, roomId, +1);
      return { snapshot };
    },
    onError: (_err, _roomId, ctx) => {
      ctx?.snapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
    },
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
    // 활성 방 즉시 비우고, 목록 joinedCount -1. 실패 시 롤백.
    onMutate: async (roomId) => {
      await Promise.all([
        qc.cancelQueries({ queryKey: userKeys.activeRoom() }),
        qc.cancelQueries({ queryKey: roomKeys.lists() }),
      ]);
      const activeSnapshot = qc.getQueryData<GetActiveRoomResponse>(
        userKeys.activeRoom(),
      );
      const listSnapshot = qc.getQueriesData<RoomType[]>({
        queryKey: roomKeys.lists(),
      });
      patchActiveRoom(qc, roomId, null);
      patchRoomListJoinedCount(qc, roomId, -1);
      return { activeSnapshot, listSnapshot };
    },
    onError: (_err, _roomId, ctx) => {
      if (ctx?.activeSnapshot)
        qc.setQueryData(userKeys.activeRoom(), ctx.activeSnapshot);
      ctx?.listSnapshot?.forEach(([key, data]) => qc.setQueryData(key, data));
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
    onMutate: async (roomId) => {
      await qc.cancelQueries({ queryKey: userKeys.activeRoom() });
      const activeSnapshot = qc.getQueryData<GetActiveRoomResponse>(
        userKeys.activeRoom(),
      );
      patchActiveRoom(qc, roomId, null);
      return { activeSnapshot };
    },
    onError: (_err, _roomId, ctx) => {
      if (ctx?.activeSnapshot)
        qc.setQueryData(userKeys.activeRoom(), ctx.activeSnapshot);
    },
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
    // 즉시 "calling" 으로 전환 — 서버 응답 후 실제 상태로 덮어씀.
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: userKeys.activeRoom() }),
        qc.cancelQueries({ queryKey: roomKeys.detail(roomId) }),
      ]);
      const activeSnapshot = qc.getQueryData<GetActiveRoomResponse>(
        userKeys.activeRoom(),
      );
      const detailSnapshot = qc.getQueryData<ActiveRoom>(
        roomKeys.detail(roomId),
      );
      patchActiveRoom(qc, roomId, { callStatus: "calling" });
      patchRoomDetail(qc, roomId, { callStatus: "calling" });
      return { activeSnapshot, detailSnapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.activeSnapshot)
        qc.setQueryData(userKeys.activeRoom(), ctx.activeSnapshot);
      if (ctx?.detailSnapshot)
        qc.setQueryData(roomKeys.detail(roomId), ctx.detailSnapshot);
    },
    onSuccess: (data: CallStatusResponse) => {
      // 서버가 반환한 실제 상태로 즉시 동기화.
      patchActiveRoom(qc, roomId, { callStatus: data.callStatus });
      patchRoomDetail(qc, roomId, { callStatus: data.callStatus });
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
    onMutate: async () => {
      await Promise.all([
        qc.cancelQueries({ queryKey: userKeys.activeRoom() }),
        qc.cancelQueries({ queryKey: roomKeys.detail(roomId) }),
      ]);
      const activeSnapshot = qc.getQueryData<GetActiveRoomResponse>(
        userKeys.activeRoom(),
      );
      const detailSnapshot = qc.getQueryData<ActiveRoom>(
        roomKeys.detail(roomId),
      );
      patchActiveRoom(qc, roomId, { callStatus: "pending" });
      patchRoomDetail(qc, roomId, { callStatus: "pending" });
      return { activeSnapshot, detailSnapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.activeSnapshot)
        qc.setQueryData(userKeys.activeRoom(), ctx.activeSnapshot);
      if (ctx?.detailSnapshot)
        qc.setQueryData(roomKeys.detail(roomId), ctx.detailSnapshot);
    },
    onSuccess: (data: CallStatusResponse) => {
      patchActiveRoom(qc, roomId, { callStatus: data.callStatus });
      patchRoomDetail(qc, roomId, { callStatus: data.callStatus });
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
