"use client";

import { useQuery } from "@tanstack/react-query";

import { getRooms } from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import type { GetRoomsParams } from "@/features/rooms/api/room.types";

export function useRoomsQuery(params: GetRoomsParams = {}) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRooms(params),
  });
}
