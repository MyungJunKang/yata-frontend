"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
import type {
  GetRideHistoryParams,
  UserType,
} from "@/features/user/api/user.types";

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
    // 다른 멤버의 액션(호스트의 택시 호출/방 종료 등)을 빠르게 반영하기 위한 폴링.
    // 활성 방이 사라지면(=종료) 폴링을 중단한다.
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || !data.room) return false;
      return 5_000;
    },
    refetchOnWindowFocus: true,
    refetchIntervalInBackground: true,
  });
}

export function useRideHistoryQuery(params: GetRideHistoryParams = {}) {
  return useQuery({
    queryKey: userKeys.rideHistory(params),
    queryFn: () => getRideHistory(params),
  });
}

/**
 * 전체보기용 cursor 기반 무한스크롤.
 * 응답이 단순 배열이라 hasMore 메타가 없으므로 page.length < limit 면 끝으로 간주.
 */
export function useRideHistoryInfiniteQuery(limit = 20) {
  return useInfiniteQuery({
    queryKey: userKeys.rideHistoryInfinite(limit),
    queryFn: ({ pageParam }) =>
      getRideHistory({ limit, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length < limit
        ? undefined
        : lastPage[lastPage.length - 1].id,
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
    // 백엔드가 업로드 시점에 user.profileImageUrl 을 자동 갱신하므로 me 캐시 무효화로 충분.
    // 응답의 url 을 즉시 캐시에 주입해 invalidate refetch 전에도 새 사진이 노출되도록 함.
    onSuccess: (result) => {
      qc.setQueryData<UserType>(userKeys.me(), (prev) =>
        prev ? { ...prev, profileImageUrl: result.url } : prev,
      );
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
