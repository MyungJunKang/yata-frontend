"use client";

import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/features/messages/api/messages.types";

type Props = {
  message: ChatMessage;
  /** 현재 로그인 사용자 id — sender 와 비교해 내 메시지/상대 메시지 판단 */
  meId: string | null;
  /** 같은 발신자의 직전 메시지 — 아바타/이름 그룹핑용 */
  showHeader: boolean;
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function MessageBubble({ message, meId, showHeader }: Props) {
  if (message.kind === "system") {
    return <SystemMessage message={message} />;
  }
  const isMine = !!meId && message.senderId === meId;
  return isMine ? (
    <MyMessage message={message} />
  ) : (
    <OtherMessage message={message} showHeader={showHeader} />
  );
}

function SystemMessage({ message }: { message: ChatMessage }) {
  const label = message.text ?? "시스템 메시지";
  return (
    <div className="flex w-full items-center justify-center py-1">
      <span className="rounded-full bg-bg-subtle px-3 py-1.5 text-caption-1 font-bold text-fg-tertiary">
        {label}
      </span>
    </div>
  );
}

function OtherMessage({
  message,
  showHeader,
}: {
  message: ChatMessage;
  showHeader: boolean;
}) {
  return (
    <div className="flex w-full items-start gap-2.5">
      <div className="size-9 shrink-0">
        {showHeader && (
          <Avatar name={message.senderName} url={message.avatarUrl} />
        )}
      </div>
      <div className="flex max-w-[78%] flex-col gap-1">
        {showHeader && (
          <p className="px-1 text-caption-1 font-bold text-fg-point">
            {message.senderName}
          </p>
        )}
        <BubbleBody message={message} variant="other" />
        <p className="px-1 text-[10px] font-bold text-fg-tertiary">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function MyMessage({ message }: { message: ChatMessage }) {
  return (
    <div className="flex w-full justify-end">
      <div className="flex max-w-[78%] flex-col items-end gap-1">
        <BubbleBody message={message} variant="mine" />
        <p className="px-1 text-[10px] font-bold text-fg-tertiary">
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

function BubbleBody({
  message,
  variant,
}: {
  message: ChatMessage;
  variant: "mine" | "other";
}) {
  const text = message.text ?? "";
  return (
    <div
      className={cn(
        "px-3.5 py-3 text-body-2 leading-snug",
        variant === "mine"
          ? "rounded-bl-2xl rounded-br-md rounded-tl-2xl rounded-tr-2xl bg-point-400 text-fg-inverse shadow-[0_6px_16px_0_rgba(129,109,236,0.18)]"
          : "rounded-bl-md rounded-br-2xl rounded-tl-2xl rounded-tr-2xl bg-bg-normal text-fg-primary shadow-sm",
      )}
    >
      {text || <span className="opacity-60">(메시지 없음)</span>}
    </div>
  );
}

function Avatar({
  name,
  url,
}: {
  name: string;
  url: string | null;
}) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="size-9 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-point-300 text-caption-1 font-bold text-fg-inverse">
      {name.slice(0, 1) || "?"}
    </div>
  );
}
