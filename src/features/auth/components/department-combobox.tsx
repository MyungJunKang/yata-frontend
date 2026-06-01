"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { SSU_DEPARTMENTS } from "@/features/auth/lib/ssu-departments";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  invalid?: boolean;
};

export function DepartmentCombobox({
  id,
  value,
  onChange,
  onBlur,
  placeholder = "학과 선택",
  invalid,
}: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const rootRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

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
    if (!q) return SSU_DEPARTMENTS;
    return SSU_DEPARTMENTS.filter((d) => d.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = (dep: string) => {
    onChange(dep);
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
          value ? "text-fg-primary" : "text-fg-tertiary",
        )}
      >
        <span className="truncate">{value || placeholder}</span>
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
          <div className="flex items-center gap-2 border-b border-stroke-thin px-4 py-2">
            <Search className="size-4 shrink-0 text-fg-tertiary" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="학과 검색"
              className="flex-1 bg-transparent text-body-2 text-fg-primary outline-none placeholder:text-fg-tertiary"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-body-2 text-fg-tertiary">
                검색 결과가 없어요.
              </li>
            ) : (
              filtered.map((dep) => {
                const selected = value === dep;
                return (
                  <li key={dep}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => handleSelect(dep)}
                      className={cn(
                        "flex w-full items-center justify-between px-4 py-2.5 text-left text-body-2 transition-colors",
                        selected
                          ? "bg-point-50 text-fg-point"
                          : "text-fg-primary hover:bg-bg-elevated",
                      )}
                    >
                      <span>{dep}</span>
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
