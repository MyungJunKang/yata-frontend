"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Period = "오전" | "오후";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);
const PERIODS: Period[] = ["오전", "오후"];

const ITEM_HEIGHT = 44;
const VISIBLE_COUNT = 5;
const PAD_COUNT = Math.floor(VISIBLE_COUNT / 2);

type Props = {
  open: boolean;
  initial: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

function decompose(d: Date): { period: Period; hour12: number; minute5: number } {
  const period: Period = d.getHours() < 12 ? "오전" : "오후";
  const h = d.getHours() % 12;
  const hour12 = h === 0 ? 12 : h;
  const minute5 = Math.min(55, Math.round(d.getMinutes() / 5) * 5);
  return { period, hour12, minute5 };
}

export function TimePickerSheet({ open, initial, onClose, onConfirm }: Props) {
  // initial 값으로 lazy-init — 첫 오픈 시 깜빡임 없이 현재 시각이 보이도록.
  const initialDecomposed = decompose(initial);
  const [period, setPeriod] = useState<Period>(initialDecomposed.period);
  const [hour, setHour] = useState<number>(initialDecomposed.hour12);
  const [minute, setMinute] = useState<number>(initialDecomposed.minute5);

  // open 토글 시 initial 값으로 재동기화 (외부에서 시간이 바뀐 경우 반영)
  useEffect(() => {
    if (!open) return;
    const { period, hour12, minute5 } = decompose(initial);
    setPeriod(period);
    setHour(hour12);
    setMinute(minute5);
  }, [open, initial]);

  // open 중 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const handleConfirm = () => {
    const h24 =
      period === "오전"
        ? hour === 12
          ? 0
          : hour
        : hour === 12
          ? 12
          : hour + 12;
    const next = new Date(initial);
    next.setHours(h24, minute, 0, 0);
    onConfirm(next);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="출발 시각 선택"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div className="relative w-full max-w-screen-sm rounded-t-2xl bg-bg-normal shadow-2xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-strong-1 text-fg-primary">출발 시각</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-8 items-center justify-center rounded-full text-fg-tertiary hover:text-fg-primary"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="relative px-5 pt-2">
          {/* 중앙 highlight bar */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 z-10 rounded-md bg-point-50"
            style={{
              top: `${PAD_COUNT * ITEM_HEIGHT + 8}px`,
              height: `${ITEM_HEIGHT}px`,
            }}
          />
          {/* 상/하 페이드 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 top-2 z-20 h-[44px] bg-gradient-to-b from-bg-normal to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-5 bottom-2 z-20 h-[44px] bg-gradient-to-t from-bg-normal to-transparent"
          />

          <div className="grid grid-cols-3 gap-2">
            <Wheel
              items={PERIODS.map((p) => ({ value: p, label: p }))}
              value={period}
              onChange={setPeriod}
            />
            <Wheel
              items={HOURS.map((h) => ({ value: h, label: String(h) }))}
              value={hour}
              onChange={setHour}
            />
            <Wheel
              items={MINUTES.map((m) => ({
                value: m,
                label: m.toString().padStart(2, "0"),
              }))}
              value={minute}
              onChange={setMinute}
            />
          </div>
        </div>

        <div className="px-5 pb-6 pt-5">
          <Button
            variant="point"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
          >
            확인
          </Button>
        </div>
      </div>
    </div>
  );
}

function Wheel<T extends string | number>({
  items,
  value,
  onChange,
}: {
  items: { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const settleRef = useRef<number | null>(null);
  const userScrollingRef = useRef(false);

  // value 변화 시 해당 인덱스로 정렬 (외부 동기화)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (userScrollingRef.current) return;
    const idx = items.findIndex((i) => i.value === value);
    if (idx < 0) return;
    el.scrollTo({ top: idx * ITEM_HEIGHT, behavior: "auto" });
  }, [value, items]);

  const handleScroll = () => {
    const el = ref.current;
    if (!el) return;
    userScrollingRef.current = true;
    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      const idx = Math.round(el.scrollTop / ITEM_HEIGHT);
      const safeIdx = Math.max(0, Math.min(items.length - 1, idx));
      const newVal = items[safeIdx].value;
      // snap to exact position
      const targetTop = safeIdx * ITEM_HEIGHT;
      if (Math.abs(el.scrollTop - targetTop) > 0.5) {
        el.scrollTo({ top: targetTop, behavior: "smooth" });
      }
      userScrollingRef.current = false;
      if (newVal !== value) onChange(newVal);
    }, 110);
  };

  return (
    <div
      ref={ref}
      onScroll={handleScroll}
      className="hide-scrollbar relative overflow-y-scroll text-center"
      style={{
        height: `${VISIBLE_COUNT * ITEM_HEIGHT}px`,
        scrollSnapType: "y mandatory",
        paddingTop: `${PAD_COUNT * ITEM_HEIGHT}px`,
        paddingBottom: `${PAD_COUNT * ITEM_HEIGHT}px`,
        scrollbarWidth: "none",
      }}
    >
      {items.map((it) => {
        const selected = it.value === value;
        return (
          <div
            key={String(it.value)}
            style={{
              height: ITEM_HEIGHT,
              scrollSnapAlign: "center",
            }}
            className={cn(
              "relative z-30 flex items-center justify-center text-strong-1 transition-colors",
              selected ? "text-fg-point" : "text-fg-tertiary",
            )}
          >
            {it.label}
          </div>
        );
      })}
    </div>
  );
}
