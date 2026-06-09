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
import type { UploadResult } from "@/features/user/api/user.types";
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
  return useMutation<UploadResult, Error, File>({
    // `POST /me/profile-image` 는 업로드 메타(`url`) 만 반환하고 user 를 갱신하지 않으므로
    // 클라이언트가 받은 url 을 `PATCH /me` 로 명시적으로 저장한다. PATCH 가 실패해도
    // 업로드 자체는 성공한 상태이므로 url 은 그대로 반환.
    mutationFn: async (file) => {
      const result = await uploadProfileImage(file);
      try {
        await updateProfile({
          profileImageUrl: result.url,
          profileImageWidth: result.width,
          profileImageHeight: result.height,
        });
      } catch {
        /* noop — 업로드는 성공, 저장만 실패한 케이스도 url 은 그대로 사용 */
      }
      return result;
    },
    onSuccess: (result) => {
      // 즉시 화면에 반영 + 서버 상태 최종 동기화.
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
