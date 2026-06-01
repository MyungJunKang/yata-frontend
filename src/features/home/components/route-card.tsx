"use client";

import { ArrowUpDown } from "lucide-react";

type Props = {
  from: string;
  to: string;
  onSwap?: () => void;
};

export function RouteCard({ from, to, onSwap }: Props) {
  return (
    <div className="relative overflow-hidden rounded-lg bg-bg-normal p-5 shadow-sm">
      <span
        aria-hidden
        className="absolute -right-10 -top-10 size-32 rounded-full bg-point-100/70"
      />
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex flex-1 flex-col gap-3">
          <Row label="출발지" value={from} />
          <Row label="도착지" value={to} emphasized />
        </div>
        <button
          type="button"
          onClick={onSwap}
          aria-label="출발지와 도착지 바꾸기"
          className="flex size-9 items-center justify-center rounded-full bg-bg-normal text-fg-point ring-1 ring-stroke-thin transition-colors hover:bg-point-50"
        >
          <ArrowUpDown className="size-4" />
        </button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  emphasized,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        aria-hidden
        className="size-2 shrink-0 rounded-full bg-point-500"
      />
      <div className="flex flex-col leading-tight">
        <span className="text-caption-1 text-fg-tertiary">{label}</span>
        <span
          className={
            emphasized
              ? "text-subtitle text-fg-primary"
              : "text-subtitle text-fg-primary"
          }
        >
          {value}
        </span>
      </div>
    </div>
  );
}
