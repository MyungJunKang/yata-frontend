import { api } from "@/lib/api-client";
import {
  CreateRoomBody,
  GetRoomsParams,
  GetRoomsResponse,
  RoomType,
} from "./room.types";

export const getRooms = (params: GetRoomsParams) =>
  api.get<GetRoomsResponse>("/api/rooms", { query: params });

export const createRoom = (body: CreateRoomBody) =>
  api.post<RoomType[]>("/api/rooms", { json: body });
