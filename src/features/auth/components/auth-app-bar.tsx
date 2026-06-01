import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function AuthAppBar({
  backHref,
  title = "회원가입",
}: {
  backHref: string;
  title?: string;
}) {
  return (
    <header className="flex h-14 w-full items-center justify-between">
      <Link
        href={backHref}
        aria-label="뒤로가기"
        className="-ml-2.5 flex size-11 items-center justify-center"
      >
        <ChevronLeft className="size-6 text-fg-primary" />
      </Link>
      <h1 className="text-strong-1 text-fg-primary">{title}</h1>
      <span
        aria-hidden
        className="font-display text-[20px] font-extrabold italic tracking-[-0.04em] text-fg-primary"
      >
        YATA
      </span>
    </header>
  );
}
