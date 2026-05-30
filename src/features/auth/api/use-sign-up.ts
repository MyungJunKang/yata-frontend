"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { signUp } from "@/features/auth/api/auth";
import type { SignUpRequest } from "@/features/auth/api/auth.types";

export function useSignUp({ onSettled }: { onSettled?: () => void } = {}) {
  const router = useRouter();
  return useMutation({
    mutationFn: (body: SignUpRequest) => signUp(body),
    onSuccess: () => {
      router.replace("/home");
      router.refresh();
    },
    onSettled,
  });
}
