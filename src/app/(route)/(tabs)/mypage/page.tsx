"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/features/auth/api/use-sign-out";

export default function MyPage() {
  const signOutMutation = useSignOut();

  return (
    <div className="flex min-h-[60dvh] w-full flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-title-2 text-fg-primary">마이페이지</h1>
      <p className="text-body-2 text-fg-secondary">준비 중이에요.</p>
      <Button
        variant="outline"
        onClick={() => signOutMutation.mutate()}
        disabled={signOutMutation.isPending}
        className="mt-4 h-11 gap-1.5 rounded-md border-stroke-normal px-5 text-strong-2 text-fg-secondary"
      >
        <LogOut className="size-4" />
        {signOutMutation.isPending ? "로그아웃 중…" : "로그아웃"}
      </Button>
    </div>
  );
}
