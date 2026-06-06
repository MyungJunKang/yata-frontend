"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";

export type ComboboxOption = { label: string; value: string };

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: ComboboxOption[];
  placeholder?: string;
  invalid?: boolean;
  /** 검색 입력 노출 여부 (옵션이 많을 때) */
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyText?: string;
};

/**
 * 디자인 시스템 공통 드롭다운 — 트리거 버튼 + 커스텀 패널 + 옵션 리스트.
 * 학과/학번 등 선택 UI에서 OS 기본 select 대신 동일한 룩으로 사용한다.
 */
export function Combobox({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "선택",
  invalid,
  searchable = false,
  searchPlaceholder = "검색",
  emptyText = "검색 결과가 없어요.",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
        onBlur?.();
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onBlur]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const selectedLabel = React.useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value],
  );

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        data-invalid={invalid || undefined}
        onClick={() => setOpen((p) => !p)}
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-sm bg-bg-subtle px-4",
          "text-left text-body-1 transition-colors",
          "border border-transparent",
          "focus:border-stroke-point focus:bg-bg-normal focus:outline-none",
          "data-[invalid=true]:border-stroke-warning data-[invalid=true]:bg-bg-normal",
          selectedLabel ? "text-fg-primary" : "text-fg-tertiary",
        )}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-fg-tertiary transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-sm border border-stroke-thin bg-bg-normal shadow-md"
        >
          {searchable && (
            <div className="flex items-center gap-2 border-b border-stroke-thin px-4 py-2">
              <Search className="size-4 shrink-0 text-fg-tertiary" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-body-2 text-fg-primary outline-none placeholder:text-fg-tertiary"
              />
            </div>
          )}

          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-body-2 text-fg-tertiary">
                {emptyText}
              </li>
            ) : (
              filtered.map((o) => {
                const selected = value === o.value;
                return (
                  <li key={o.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(o.value)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-left text-body-2 transition-colors",
                        selected
                          ? "bg-point-50 text-fg-point"
                          : "text-fg-primary hover:bg-bg-elevated",
                      )}
                    >
                      <span>{o.label}</span>
                      {selected && (
                        <Check className="size-4 shrink-0 text-fg-point" />
                      )}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
