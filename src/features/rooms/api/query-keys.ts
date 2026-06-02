import type { GetRoomsParams } from "@/features/rooms/api/room.types";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: GetRoomsParams) =>
    [...roomKeys.lists(), params] as const,
  detail: (id: string) => [...roomKeys.all, "detail", id] as const,
  settlement: (id: string) => [...roomKeys.all, "settlement", id] as const,
};
