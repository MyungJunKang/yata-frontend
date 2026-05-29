import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-12 w-full rounded-sm bg-bg-subtle px-4",
      "text-body-1 text-fg-primary placeholder:text-fg-tertiary",
      "border border-transparent transition-colors",
      "focus:border-stroke-point focus:bg-bg-normal focus:outline-none",
      "aria-[invalid=true]:border-stroke-warning aria-[invalid=true]:bg-bg-normal",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
