"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2 } from "lucide-react";

import { useRideHistoryInfiniteQuery } from "@/features/user/api/use-user";
import { RideCard } from "@/features/user/components/ride-card";

// 한 페이지당 가져오는 항목 수. cursor 기반 페이지네이션.
const PAGE_SIZE = 20;

export function RideHistoryScreen() {
  const router = useRouter();
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useRideHistoryInfiniteQuery(PAGE_SIZE);

  const rides = useMemo(() => data?.pages.flat() ?? [], [data]);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // sentinel 이 viewport 와 교차하면 다음 페이지 fetch.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (!hasNextPage) return;
    const io = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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
            </p>
            {rides.map((ride) => (
              <RideCard key={ride.id} ride={ride} />
            ))}
            {/* IntersectionObserver sentinel — viewport 진입 시 다음 페이지 로드 */}
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            {isFetchingNextPage && (
              <div className="flex w-full items-center justify-center gap-2 py-4 text-caption-1 font-medium text-fg-tertiary">
                <Loader2 className="size-4 animate-spin" />
                불러오는 중…
              </div>
            )}
            {!hasNextPage && rides.length > 0 && (
              <p className="py-4 text-center text-caption-1 font-medium text-fg-tertiary">
                마지막 기록까지 봤어요
              </p>
            )}
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
