"use client";

import { User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import type { UserType } from "@/features/user/api/user.types";

type Props = {
  user?: UserType;
  isLoading?: boolean;
};

export function ProfileCard({ user, isLoading }: Props) {
  return (
    <div className="flex w-full items-end gap-4">
      {/* Avatar */}
      <div className="relative size-[110px] shrink-0">
        <div className="absolute inset-x-1 top-[3px] flex items-center justify-center">
          <div className="size-[100px] -rotate-3 rounded-3xl bg-point-100/70 shadow-[0_16px_24px_0_rgba(0,0,0,0.18)]">
            {user?.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.profileImageUrl}
                alt={user.name}
                className="size-full rounded-3xl object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center rotate-3">
                <UserIcon className="size-10 text-point-400" />
              </div>
            )}
          </div>
        </div>
        {/* 인증된 학생 배지 */}
        {user?.isVerified && (
          <div className="absolute -left-1 top-[78px] flex flex-col items-center justify-center rounded-full bg-point-300 px-2.5 py-1.5 shadow-sm">
            <p className="text-[11px] font-bold leading-[1.2] text-point-700">
              인증된
            </p>
            <p className="text-[11px] font-bold leading-[1.2] text-point-700">
              학생
            </p>
          </div>
        )}
      </div>

      {/* Name + email — right aligned, bottom-aligned with avatar */}
      <div className="flex min-w-0 flex-1 flex-col items-end gap-1 leading-tight">
        <p
          className={cn(
            "truncate text-[30px] font-bold text-fg-primary",
            isLoading && "h-9 w-32 animate-pulse rounded bg-bg-subtle",
          )}
        >
          {!isLoading && (user?.name ?? "—")}
        </p>
        <p
          className={cn(
            "truncate text-[12px] text-fg-secondary",
            isLoading && "h-4 w-40 animate-pulse rounded bg-bg-subtle",
          )}
        >
          {!isLoading && (user?.email ?? "")}
        </p>
      </div>
    </div>
  );
}
