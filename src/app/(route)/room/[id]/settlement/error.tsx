"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function SettlementError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("settlement route error", error);
  }, [error]);

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-bg-page">
      <header className="flex h-14 w-full items-center gap-1 border-b border-stroke-thin bg-bg-normal px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center text-fg-primary"
        >
          <ChevronLeft className="size-5" />
        </button>
        <p className="text-strong-2 text-fg-primary">정산</p>
      </header>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-strong-1 text-fg-primary">
          정산 화면을 불러오지 못했어요.
        </p>
        <p className="text-body-2 text-fg-secondary">
          잠시 후 다시 시도하거나 방으로 돌아가 주세요.
        </p>
        <div className="mt-2 flex gap-2">
          <Button variant="point-soft" size="md" onClick={() => router.back()}>
            방으로
          </Button>
          <Button variant="point" size="md" onClick={() => reset()}>
            다시 시도
          </Button>
        </div>
      </div>
    </div>
  );
}
