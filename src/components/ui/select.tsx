import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative w-full">
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full appearance-none rounded-sm bg-bg-subtle px-4 pr-10",
        "text-body-1 text-fg-primary",
        "border border-transparent transition-colors",
        "focus:border-stroke-point focus:bg-bg-normal focus:outline-none",
        "aria-[invalid=true]:border-stroke-warning aria-[invalid=true]:bg-bg-normal",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-fg-tertiary" />
  </div>
));
Select.displayName = "Select";

export { Select };
