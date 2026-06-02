export type MessageKind = "text" | "image" | "system" | "announcement";

export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  avatarUrl: string | null;
  kind: MessageKind;
  text: string | null;
  attachmentUrl: string | null;
  data: Record<string, unknown> | null;
  createdAt: string;
};

export type GetMessagesResponse = ChatMessage[];

export type SendMessageBody =
  | { kind: "text"; text: string }
  | { kind: "image"; attachmentUrl: string }
  | { kind: "system"; data?: Record<string, unknown> };

export type SendMessageResponse = {
  message: ChatMessage;
};
