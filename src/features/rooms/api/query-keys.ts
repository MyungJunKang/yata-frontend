import type { GetRoomsParams } from "@/features/rooms/api/room.types";

export const roomKeys = {
  all: ["rooms"] as const,
  lists: () => [...roomKeys.all, "list"] as const,
  list: (params: GetRoomsParams) =>
    [...roomKeys.lists(), params] as const,
};
