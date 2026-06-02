import { api } from "@/lib/api-client";
import {
  ActiveRoom,
  CreateRoomBody,
  GetRoomsParams,
  GetRoomsResponse,
  RoomType,
} from "./room.types";

export const getRooms = (params: GetRoomsParams) =>
  api.get<GetRoomsResponse>("/api/rooms", { query: params });

export const getRoomDetail = (id: string) =>
  api.get<ActiveRoom>(`/api/rooms/${id}`);

export const createRoom = (body: CreateRoomBody) =>
  api.post<RoomType[]>("/api/rooms", { json: body });

export const joinRoom = (id: string) =>
  api.post<unknown>(`/api/rooms/${id}/join`);

export const leaveRoom = (id: string) =>
  api.post<unknown>(`/api/rooms/${id}/leave`);

/** 호스트 전용 — 방 종료/아카이브 */
export const archiveRoom = (id: string) =>
  api.post<unknown>(`/api/rooms/${id}/archive`);
