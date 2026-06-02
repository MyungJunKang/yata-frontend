import { api } from "@/lib/api-client";

import type {
  GetMessagesResponse,
  SendMessageBody,
  SendMessageResponse,
} from "@/features/messages/api/messages.types";

export const getMessages = (roomId: string) =>
  api.get<GetMessagesResponse>(`/api/rooms/${roomId}/messages`);

export const sendMessage = (roomId: string, body: SendMessageBody) =>
  api.post<SendMessageResponse>(`/api/rooms/${roomId}/messages`, {
    json: body,
  });
