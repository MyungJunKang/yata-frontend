"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, Plus, User, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** BottomNav 가 표시될 경로. 이 외 경로에서는 자체적으로 숨겨진다. */
const VISIBLE_PATHS = new Set<string>(["/home", "/mypage"]);

export function BottomNav() {
  // root layout 에서 한 번만 마운트되며 path 별로 가시성만 토글한다 (DOM remount X).
  const pathname = usePathname();
  const visible = VISIBLE_PATHS.has(pathname);
  return (
    <nav
      aria-label="주요 메뉴"
      aria-hidden={!visible}
      className={cn(
        "fixed bottom-0 left-1/2 z-40 w-full max-w-screen-sm -translate-x-1/2 border-t border-stroke-thin bg-bg-normal md:max-w-screen-md lg:max-w-screen-lg",
        !visible && "hidden",
      )}
    >
      <div className="flex h-20 items-center justify-around px-8">
        <NavItem
          href="/home"
          icon={House}
          label="홈"
          active={pathname === "/home"}
        />
        <FabItem href="/create-room" />
        <NavItem
          href="/mypage"
          icon={User}
          label="마이"
          active={pathname === "/mypage"}
        />
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-16 flex-col items-center gap-1 transition-colors",
        active ? "text-fg-point" : "text-fg-tertiary hover:text-fg-secondary",
      )}
    >
      <Icon className="size-6" strokeWidth={active ? 2.4 : 2} />
      <span className="text-caption-1 font-medium">{label}</span>
    </Link>
  );
}

function FabItem({ href }: { href: string }) {
  return (
    <Link
      href={href}
      aria-label="방 만들기"
      className="flex size-14 items-center justify-center rounded-full bg-point-500 text-fg-inverse shadow-point transition-colors hover:bg-point-600"
    >
      <Plus className="size-6" strokeWidth={2.5} />
    </Link>
  );
}
