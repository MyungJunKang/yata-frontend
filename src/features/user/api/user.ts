import { api } from "@/lib/api-client";

import type { UserStatsResponse, UserType } from "./user.types";
import type { GetActiveRoomResponse } from "@/features/rooms/api/room.types";

export const getUser = () => api.get<UserType>("/api/me");

export const getActiveRoom = () =>
  api.get<GetActiveRoomResponse>("/api/me/active-room");

export const getUserStats = () => api.get<UserStatsResponse>("/api/me/stats");
