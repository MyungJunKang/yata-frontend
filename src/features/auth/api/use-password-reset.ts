"use client";

import { useMutation } from "@tanstack/react-query";

import {
  requestPasswordReset,
  resetPassword,
} from "@/features/auth/api/auth";
import type {
  RequestPasswordResetBody,
  ResetPasswordBody,
} from "@/features/auth/api/auth.types";

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: (body: RequestPasswordResetBody) => requestPasswordReset(body),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (body: ResetPasswordBody) => resetPassword(body),
  });
}
