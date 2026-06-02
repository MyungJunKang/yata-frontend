"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMessages, sendMessage } from "@/features/messages/api/messages";
import { messageKeys } from "@/features/messages/api/query-keys";
import type {
  ChatMessage,
  SendMessageBody,
} from "@/features/messages/api/messages.types";

const POLL_INTERVAL_MS = 5000;

export function useMessagesQuery(roomId: string | null) {
  return useQuery({
    queryKey: messageKeys.list(roomId ?? ""),
    queryFn: () => {
      if (!roomId) throw new Error("roomId missing");
      return getMessages(roomId);
    },
    enabled: !!roomId,
    refetchInterval: roomId ? POLL_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });
}

export function useSendMessageMutation(
  roomId: string,
  me?: { id: string; name: string; profileImageUrl?: string | null } | null,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: SendMessageBody) => sendMessage(roomId, body),
    // optimistic update
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: messageKeys.list(roomId) });
      const prev =
        qc.getQueryData<ChatMessage[]>(messageKeys.list(roomId)) ?? [];

      const optimistic: ChatMessage = {
        id: `optimistic-${Date.now()}`,
        senderId: me?.id ?? "",
        senderName: me?.name ?? "",
        avatarUrl: me?.profileImageUrl ?? null,
        kind: body.kind,
        text: body.kind === "text" ? body.text : null,
        attachmentUrl: body.kind === "image" ? body.attachmentUrl : null,
        data: body.kind === "system" ? (body.data ?? null) : null,
        createdAt: new Date().toISOString(),
      };
      qc.setQueryData<ChatMessage[]>(messageKeys.list(roomId), [
        ...prev,
        optimistic,
      ]);
      return { prev, optimisticId: optimistic.id };
    },
    onError: (_err, _body, ctx) => {
      if (ctx?.prev) qc.setQueryData(messageKeys.list(roomId), ctx.prev);
    },
    onSuccess: (data, _body, ctx) => {
      // optimistic 을 서버 응답으로 치환
      qc.setQueryData<ChatMessage[]>(messageKeys.list(roomId), (curr = []) =>
        curr.map((m) => (m.id === ctx?.optimisticId ? data.message : m)),
      );
    },
    onSettled: () => {
      // 안전망: 잠시 후 server-truth 로 동기화
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}
