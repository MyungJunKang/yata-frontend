"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import { buildSsuEmail, getEmailLocalPart } from "@/features/auth/lib/format";

type Props = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
> & {
  value: string;
  onChange: (email: string) => void;
};

export const EmailSsuInput = React.forwardRef<HTMLInputElement, Props>(
  ({ value, onChange, className, placeholder = "student_id", ...props }, ref) => {
    const local = getEmailLocalPart(value);
    const suffixRef = React.useRef<HTMLSpanElement>(null);
    const [pr, setPr] = React.useState(120);

    React.useLayoutEffect(() => {
      if (suffixRef.current) setPr(suffixRef.current.offsetWidth + 24);
    }, []);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type="text"
          inputMode="email"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={placeholder}
          value={local}
          onChange={(e) => onChange(buildSsuEmail(e.target.value))}
          style={{ paddingRight: pr }}
          className={className}
          {...props}
        />
        <span
          ref={suffixRef}
          aria-hidden
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-body-1 text-fg-tertiary"
        >
          @soongsil.ac.kr
        </span>
      </div>
    );
  },
);
EmailSsuInput.displayName = "EmailSsuInput";
