import { api } from "@/lib/api-client";
import type {
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
