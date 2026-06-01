"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createRoom } from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import type { CreateRoomBody } from "@/features/rooms/api/room.types";

export function useCreateRoomMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoomBody) => createRoom(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      router.replace("/home");
    },
  });
}
