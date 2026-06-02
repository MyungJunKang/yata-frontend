import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "rounded-xl font-bold",
    "transition-[transform,background-color,color,border-color,opacity] duration-150 ease-[var(--ease-apple)]",
    "active:scale-[0.97] will-change-transform",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stroke-point focus-visible:ring-offset-2 focus-visible:ring-offset-bg-page",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // 주력 보라 버튼
        point: "bg-point-500 text-fg-inverse hover:bg-point-600",
        // 옅은 보라 — 보조 액션
        "point-soft": "bg-point-100 text-fg-point hover:bg-point-200",
        // 윤곽선 — 중성 보조 액션
        outline:
          "border border-stroke-normal bg-bg-normal text-fg-secondary hover:bg-bg-subtle hover:text-fg-primary",
        // 투명 — 가벼운 액션
        ghost: "text-fg-secondary hover:bg-bg-subtle hover:text-fg-primary",
        // 위험 — 삭제/탈퇴
        danger:
          "bg-fg-warning text-fg-inverse hover:opacity-90",
        // shadcn 호환 (deprecated — 점진 마이그레이트)
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        link: "text-fg-point underline-offset-4 hover:underline active:scale-100",
      },
      size: {
        sm: "h-9 px-3 text-[13px]",
        md: "h-11 px-5 text-[14px]",
        lg: "h-14 px-6 text-[16px]",
        icon: "size-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "point",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
