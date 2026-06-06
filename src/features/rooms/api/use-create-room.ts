"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { createRoom } from "@/features/rooms/api/room";
import { roomKeys } from "@/features/rooms/api/query-keys";
import type { CreateRoomBody } from "@/features/rooms/api/room.types";
import { userKeys } from "@/features/user/api/query-keys";

export function useCreateRoomMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateRoomBody) => createRoom(body),
    onSuccess: () => {
      // 방을 만들면 호스트로 참여 상태가 되므로 룸 리스트뿐 아니라
      // active-room / me(activeRoomId) 캐시도 무효화해야 홈 배너가 바로 뜬다.
      queryClient.invalidateQueries({ queryKey: roomKeys.all });
      queryClient.invalidateQueries({ queryKey: userKeys.activeRoom() });
      queryClient.invalidateQueries({ queryKey: userKeys.me() });
      router.replace("/home");
    },
  });
}
