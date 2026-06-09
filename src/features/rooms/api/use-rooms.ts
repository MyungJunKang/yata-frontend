"use client";

import { useQuery } from "@tanstack/react-query";

import { getRoomDetail, getRooms } from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import type { GetRoomsParams } from "@/features/rooms/api/room.types";

/**
 * 방 목록 — 매칭 가능한 방의 인원/상태가 다른 사용자 액션으로 자주 바뀌므로
 * 가벼운 폴링으로 동기화. 백그라운드 탭에서는 멈추고, 포커스 복귀/재접속 시
 * 즉시 최신화.
 */
export function useRoomsQuery(params: GetRoomsParams = {}) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRooms(params),
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * 방 단건 조회 — 멤버/콜 상태가 호스트·다른 멤버 액션으로 바뀌므로 폴링.
 * 종료(archived) 되었거나 이용이 끝났으면(completed) 폴링 중단.
 */
export function useRoomDetailQuery(id: string | null) {
  return useQuery({
    queryKey: roomKeys.detail(id ?? ""),
    queryFn: () => {
      if (!id) throw new Error("room id missing");
      return getRoomDetail(id);
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      if (data.archivedAt) return false;
      if (data.callStatus === "completed") return false;
      return 5_000;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
