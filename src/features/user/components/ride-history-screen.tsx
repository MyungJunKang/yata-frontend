"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { useRideHistoryQuery } from "@/features/user/api/use-user";
import { RideCard } from "@/features/user/components/ride-card";

// 무한스크롤은 후속 — 일단 한 번에 최대치 정도를 가져온다.
const PAGE_LIMIT = 50;

export function RideHistoryScreen() {
  const router = useRouter();
  const { data, isLoading, isError } = useRideHistoryQuery({
    limit: PAGE_LIMIT,
  });
  const rides = data ?? [];

  return (
    <div className="flex min-h-[100dvh] w-full flex-col bg-bg-page">
      <header className="sticky top-0 z-10 flex h-14 w-full items-center border-b border-stroke-thin bg-bg-normal px-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className="flex size-11 items-center justify-center"
        >
          <ChevronLeft className="size-6 text-fg-primary" />
        </button>
        <h1 className="flex h-11 items-center text-strong-1 font-bold leading-none text-fg-primary">
          전체 이용 기록
        </h1>
      </header>

      <div className="flex w-full flex-1 flex-col gap-3 px-5 pb-16 pt-4">
        {isLoading ? (
          <RideListSkeleton />
        ) : isError ? (
          <RideListMessage text="이용 기록을 불러오지 못했어요." />
        ) : rides.length === 0 ? (
          <RideListMessage text="아직 이용 기록이 없어요." />
        ) : (
          <>
            <p className="px-1 text-caption-1 font-medium text-fg-tertiary">
              총 {rides.length}건
              {rides.length >= PAGE_LIMIT && " (최근 기록부터 표시)"}
            </p>
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function RideListMessage({ text }: { text: string }) {
  return (
    <div className="flex w-full items-center justify-center rounded-3xl bg-bg-normal px-5 py-12 text-[13px] text-fg-tertiary shadow-sm">
      {text}
    </div>
  );
}

function RideListSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[148px] w-full animate-pulse rounded-3xl bg-bg-normal shadow-sm"
        />
      ))}
    </>
  );
}
