import { cn } from "@/lib/utils";

export function SignupProgress({
  step,
  total = 3,
}: {
  step: 1 | 2 | 3;
  total?: number;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={total}
      className="flex w-full items-center gap-2"
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i < step ? "bg-point-500" : "bg-bg-subtle",
          )}
        />
      ))}
    </div>
  );
}
