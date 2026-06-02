import { cn } from "@/lib/utils";

/**
 * 모든 화면 우상단 (또는 가운데) 에 동일한 스타일로 노출되는 YATA 워드마크.
 * 변경 시 한 군데만 손보면 된다.
 */
export function YataLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-display text-[20px] font-extrabold italic tracking-[-0.04em] text-fg-primary",
        className,
      )}
    >
      YATA
    </span>
  );
}
