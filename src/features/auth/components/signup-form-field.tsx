import { cn } from "@/lib/utils";

type Props = {
  label: string;
  htmlFor: string;
  helper?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
};

export function SignupFormField({
  label,
  htmlFor,
  helper,
  error,
  required,
  className,
  children,
}: Props) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="flex items-center gap-0.5 text-[14px] font-medium text-fg-secondary"
      >
        {label}
        {required && (
          <span className="text-fg-warning" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error ? (
        <p className="text-[12px] font-medium text-fg-warning">{error}</p>
      ) : helper ? (
        <p className="text-[12px] font-medium text-fg-tertiary">{helper}</p>
      ) : null}
    </div>
  );
}
