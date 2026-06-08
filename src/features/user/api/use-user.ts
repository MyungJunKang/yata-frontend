"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  changePassword,
  deleteAccount,
  getActiveRoom,
  getPaymentAccount,
  getRideHistory,
  getUser,
  getUserStats,
  updatePaymentAccount,
  updateProfile,
  uploadProfileImage,
} from "@/features/user/api/user";
import { userKeys } from "@/features/user/api/query-keys";
import type { GetRideHistoryParams } from "@/features/user/api/user.types";

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
    // 다른 멤버의 액션(호스트의 택시 호출 등)을 반영하기 위해 가벼운 폴링.
    // 방이 종료(archivedAt) 되거나 활성 방이 없으면 폴링을 중단한다.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || !data.room) return false;
      if (data.room.archivedAt) return false;
      return 15_000;
    },
    refetchOnWindowFocus: true,
  });
}

export function useRideHistoryQuery(params: GetRideHistoryParams = {}) {
  return useQuery({
    queryKey: userKeys.rideHistory(params),
    queryFn: () => getRideHistory(params),
  });
}

export function usePaymentAccountQuery() {
  return useQuery({
    queryKey: userKeys.paymentAccount(),
    queryFn: getPaymentAccount,
    // 계좌 미등록 시 404 가 정상 → 재시도 안 함
    retry: false,
  });
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useUpdatePaymentAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePaymentAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.paymentAccount() });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: changePassword,
  });
}

export function useUploadProfileImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadProfileImage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.me() });
    },
  });
}

export function useDeleteAccountMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      // 세션 종료 → 캐시 전체 제거
      qc.clear();
    },
  });
}
