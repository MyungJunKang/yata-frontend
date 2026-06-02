"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getActiveRoom,
  getUser,
  getUserStats,
} from "@/features/user/api/user";
import { userKeys } from "@/features/user/api/query-keys";

export function useUserQuery() {
  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getUser,
  });
}

export function useUserStatsQuery() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: getUserStats,
  });
}

export function useActiveRoomQuery() {
  return useQuery({
    queryKey: userKeys.activeRoom(),
    queryFn: getActiveRoom,
  });
}
