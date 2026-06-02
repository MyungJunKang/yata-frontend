"use client";

import { useRef, useState } from "react";
import { Send } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
};

export function MessageInput({ onSend, disabled }: Props) {
  const [value, setValue] = useState("");
  const isComposingRef = useRef(false);

  const canSend = value.trim().length > 0 && !disabled;

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="flex w-full items-end gap-2 border-t border-stroke-thin bg-bg-normal px-4 pb-5 pt-3">
      <div className="flex min-h-11 flex-1 items-center rounded-3xl bg-bg-subtle px-4 py-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onCompositionStart={() => {
            isComposingRef.current = true;
          }}
          onCompositionEnd={() => {
            isComposingRef.current = false;
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !isComposingRef.current
            ) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="메시지를 입력하세요..."
          rows={1}
          className="max-h-28 w-full resize-none bg-transparent text-body-2 leading-snug text-fg-primary placeholder:text-fg-tertiary focus:outline-none"
          disabled={disabled}
        />
      </div>
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="보내기"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-2xl transition-colors",
          canSend
            ? "bg-point-400 text-fg-inverse hover:bg-point-500"
            : "bg-bg-subtle text-fg-tertiary",
        )}
      >
        <Send className="size-4" />
      </button>
    </div>
  );
}
