import * as React from "react";
import { cn } from "@/lib/utils";

type SegmentedOption<T extends string> = { label: string; value: T };

type SegmentedProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
  invalid?: boolean;
  className?: string;
};

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  invalid,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-invalid={invalid || undefined}
      className={cn("flex w-full gap-3", className)}
    >
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={(e) => {
              e.preventDefault();
              onChange(opt.value);
            }}
            className={cn(
              "flex h-12 flex-1 items-center justify-center rounded-sm border text-body-1 font-medium transition-colors",
              selected
                ? "border-stroke-point bg-point-100 text-fg-point"
                : "border-transparent bg-bg-subtle text-fg-secondary hover:text-fg-primary",
              invalid && !selected && "border-stroke-warning",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
