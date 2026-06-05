"use client";

import { useMutation } from "@tanstack/react-query";

import { signUp } from "@/features/auth/api/auth";
import type { SignUpBody } from "@/features/auth/api/auth.types";

export function useSignUp({ onSettled }: { onSettled?: () => void } = {}) {
  return useMutation({
    mutationFn: (body: SignUpBody) => signUp(body),
    onSettled,
  });
}
