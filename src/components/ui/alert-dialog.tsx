"use client";

import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  /** 상단 아이콘 — 기본 Info */
  icon?: LucideIcon;
  onClose: () => void;
};

const ANIM_MS = 200;

/**
 * 단일 액션 안내 다이얼로그. 상단 아이콘 + 제목 + 설명 + 풀폭 "확인" 버튼.
 * 애니메이션/스타일 규칙은 ConfirmDialog 와 동일.
 */
export function AlertDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  icon: Icon = Info,
  onClose,
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
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [render, onClose]);

  if (!render) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alert-title"
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className={cn(
          "absolute inset-0 cursor-default bg-black/40 transition-opacity duration-200 ease-out",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "relative z-10 flex w-full max-w-sm flex-col items-center gap-4 rounded-2xl bg-bg-normal p-6 text-center shadow-2xl",
          "transition-all duration-200 ease-out will-change-transform",
          active
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-[0.97] opacity-0",
        )}
      >
        <span className="flex size-14 items-center justify-center rounded-full bg-point-100 text-fg-point">
          <Icon className="size-7" />
        </span>
        <div className="flex flex-col gap-1.5">
          <h2 id="alert-title" className="text-strong-1 text-fg-primary">
            {title}
          </h2>
          {description && (
            <p className="text-body-2 leading-snug text-fg-secondary">
              {description}
            </p>
          )}
        </div>
        <Button
          variant="point"
          size="md"
          className="h-12 w-full"
          onClick={onClose}
        >
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}
