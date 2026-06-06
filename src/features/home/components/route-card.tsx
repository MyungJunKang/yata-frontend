"use client";

import { ArrowUpDown, RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";

type Props = {
  /** 미선택 시 빈 문자열/undefined → placeholder 표시 */
  from?: string;
  to?: string;
  onSwap?: () => void;
  onPickFrom?: () => void;
  onPickTo?: () => void;
  /** 출발·도착지 선택을 모두 비워 전체 방을 보기 위한 초기화 */
  onReset?: () => void;
};

export function RouteCard({
  from,
  to,
  onSwap,
  onPickFrom,
  onPickTo,
  onReset,
}: Props) {
  const showReset = !!onReset && (!!from || !!to);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-normal p-6 shadow-lg">
      <span
        aria-hidden
        className="absolute -top-32 left-[215px] size-64 rounded-full bg-point-100"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex items-start gap-4">
          {/* 출발 → 도착 세로 커넥터 */}
          <div className="flex w-2 shrink-0 flex-col items-center self-stretch py-2">
            <span className="size-2 rounded-full bg-point-500" aria-hidden />
            <span className="my-1 w-px flex-1 bg-point-200" aria-hidden />
            <span className="size-2 rounded-full bg-point-500" aria-hidden />
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3.5">
            <RouteRow
              label="출발지"
              value={from}
              placeholder="출발지를 선택하세요"
              onClick={onPickFrom}
            />
            <RouteRow
              label="도착지"
              value={to}
              placeholder="도착지를 선택하세요"
              onClick={onPickTo}
            />
          </div>

          <button
            type="button"
            onClick={onSwap}
            aria-label="출발지와 도착지 바꾸기"
            className="flex size-9 shrink-0 items-center justify-center rounded-md bg-gray-100 text-fg-point transition-colors hover:bg-point-50"
          >
            <ArrowUpDown className="size-4" />
          </button>
        </div>

        {showReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 border-t border-stroke-thin pt-3 text-caption-1 font-bold text-fg-tertiary transition-colors hover:text-fg-point"
          >
            <RotateCcw className="size-3.5" />
            초기화하고 전체 방 보기
          </button>
        )}
      </div>
    </div>
  );
}

function RouteRow({
  label,
  value,
  placeholder,
  onClick,
}: {
  label: string;
  value?: string;
  placeholder: string;
  onClick?: () => void;
}) {
  const hasValue = !!value;
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-start gap-0.5 text-left transition-opacity hover:opacity-70"
    >
      <span className="text-eyebrow text-fg-tertiary">
        {label}
      </span>
      <span
        className={cn(
          "w-full truncate text-[17px] font-bold",
          hasValue ? "text-fg-primary" : "text-fg-tertiary",
        )}
      >
        {hasValue ? value : placeholder}
      </span>
    </button>
  );
}
