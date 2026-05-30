"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signIn } from "@/features/auth/api/auth";
import type { SignInRequest } from "@/features/auth/api/auth.types";

export function useSignIn() {
  const router = useRouter();
  return useMutation({
    mutationFn: (body: SignInRequest) => signIn(body),
    onSuccess: () => {
      // 토큰은 BFF가 httpOnly cookie 로 박았으니 클라이언트는 라우팅만
      router.replace("/home");
      router.refresh();
    },
  });
}
