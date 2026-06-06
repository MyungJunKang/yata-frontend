import { api, ApiError } from "@/lib/api-client";

import type {
  ChangePasswordBody,
  DeleteAccountBody,
  GetRideHistoryParams,
  PaymentAccount,
  RideHistoryItem,
  UpdateProfileBody,
  UpdateProfileResponse,
  UploadResult,
  UserStatsResponse,
  UserType,
} from "./user.types";
import type { GetActiveRoomResponse } from "@/features/rooms/api/room.types";

export const getUser = () => api.get<UserType>("/api/me");

export const getActiveRoom = () =>
  api.get<GetActiveRoomResponse>("/api/me/active-room");

export const getUserStats = () => api.get<UserStatsResponse>("/api/me/stats");

export const getRideHistory = (params: GetRideHistoryParams = {}) =>
  api.get<RideHistoryItem[]>("/api/me/ride-history", { query: params });

export const updateProfile = (body: UpdateProfileBody) =>
  api.patch<UpdateProfileResponse>("/api/me", { json: body });

export const getPaymentAccount = () =>
  api.get<PaymentAccount>("/api/me/payment-account");

export const updatePaymentAccount = (body: PaymentAccount) =>
  api.patch<unknown>("/api/me/payment-account", { json: body });

export const changePassword = (body: ChangePasswordBody) =>
  api.post<unknown>("/api/me/password", { json: body });

/** 회원 탈퇴 — DELETE /me (성공 시 BFF가 인증 쿠키 제거) */
export const deleteAccount = (body: DeleteAccountBody) =>
  api.delete<unknown>("/api/me", { json: body });

/** 프로필 사진 업로드 — multipart/form-data (field: file) */
export const uploadProfileImage = async (
  file: File,
): Promise<UploadResult> => {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/me/profile-image", {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });

  const data = await res.text().then((t) => {
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  });
  if (!res.ok) throw new ApiError(res.status, data);
  return data as UploadResult;
};
