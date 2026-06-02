"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Variant = "default" | "danger";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ANIM_MS = 200;

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  variant = "default",
  pending,
  onConfirm,
  onCancel,
}: Props) {
  const [render, setRender] = useState(open);
  const [active, setActive] = useState(false);

  // open ↔ render/active 동기화. open=true → render→true → 한 프레임 뒤 active=true.
  // open=false → active=false → ANIM_MS 뒤 render=false.
  useEffect(() => {
    if (open) {
      setRender(true);
      const id = requestAnimationFrame(() => setActive(true));
      return () => cancelAnimationFrame(id);
    }
    setActive(false);
    const t = window.setTimeout(() => setRender(false), ANIM_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  // Esc 닫기 + body 스크롤 잠금
  useEffect(() => {
    if (!render) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [render, onCancel]);

  if (!render) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onCancel}
        className={cn(
          "absolute inset-0 cursor-default bg-black/40 transition-opacity duration-200 ease-out",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-sm flex-col gap-4 rounded-2xl bg-bg-normal p-5 shadow-2xl",
          "transition-all duration-200 ease-out will-change-transform",
          active
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.97] opacity-0",
        )}
      >
        <div className="flex flex-col gap-1.5">
          <h2 id="confirm-title" className="text-strong-1 text-fg-primary">
            {title}
          </h2>
          {description && (
            <p className="text-body-2 leading-snug text-fg-secondary">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-2 pt-1">
          <Button
            variant="outline"
            size="md"
            className={cn("flex-1 h-12")}
            onClick={onCancel}
            disabled={pending}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "danger" ? "danger" : "point"}
            size="md"
            className={cn("flex-[1.4] h-12")}
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? "처리 중…" : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
