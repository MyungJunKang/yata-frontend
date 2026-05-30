"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signOut } from "@/features/auth/api/auth";

export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => signOut(),
    onSettled: () => {
      // 쿠키는 BFF /api/auth/logout 에서 만료됨. 실패해도 클라 캐시는 비우고 로그인으로.
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
