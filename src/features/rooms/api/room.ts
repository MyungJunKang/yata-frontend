import { api } from "@/lib/api-client";
import {
  ActiveRoom,
  CallStatusResponse,
  CreateRoomBody,
  GetRoomsParams,
  GetRoomsResponse,
  RoomType,
  ShareLocationBody,
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

/** 택시 호출 — 멤버 누구나. 백엔드가 잘못된 상태면 409. */
export const callTaxi = (id: string) =>
  api.post<CallStatusResponse>(`/api/rooms/${id}/call-taxi`);

/** 택시 호출 취소 — 멤버 누구나. */
export const cancelCall = (id: string) =>
  api.post<CallStatusResponse>(`/api/rooms/${id}/cancel-call`);

/** 실시간 위치 1회 공유 */
export const shareLocation = (id: string, body: ShareLocationBody) =>
  api.post<unknown>(`/api/rooms/${id}/location`, { json: body });
