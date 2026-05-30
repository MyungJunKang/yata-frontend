import { api } from "@/lib/api-client";
import type {
  SignInRequest,
  SignInResponse,
  SignUpRequest,
  SignUpResponse,
} from "@/features/auth/api/auth.types";

export const signIn = (body: SignInRequest) =>
  api.post<SignInResponse>("/api/auth/login", { json: body });

export const signOut = () => api.post<{ ok: true }>("/api/auth/logout");

export const signUp = (body: SignUpRequest) =>
  api.post<SignUpResponse>("/api/auth/signup", { json: body });
