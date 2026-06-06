import { api } from "@/lib/api-client";
import type {
  RequestPasswordResetBody,
  ResetPasswordBody,
  SignInBody,
  SignInResponse,
  SignUpBody,
  SignUpResponse,
} from "@/features/auth/api/auth.types";

export const signIn = (body: SignInBody) =>
  api.post<SignInResponse>("/api/auth/login", { json: body });

export const signOut = () => api.post<{ ok: true }>("/api/auth/logout");

export const signUp = (body: SignUpBody) =>
  api.post<SignUpResponse>("/api/auth/signup", { json: body });

export const requestPasswordReset = (body: RequestPasswordResetBody) =>
  api.post<{ ok: true }>("/api/auth/password/forgot", { json: body });

export const resetPassword = (body: ResetPasswordBody) =>
  api.post<{ ok: true }>("/api/auth/password/reset", { json: body });
