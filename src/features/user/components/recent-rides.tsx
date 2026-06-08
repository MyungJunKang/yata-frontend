"use client";

import Link from "next/link";

import { useRideHistoryQuery } from "@/features/user/api/use-user";
import { RideCard } from "@/features/user/components/ride-card";

const RECENT_LIMIT = 5;

export function RecentRides() {
  const { data, isLoading, isError } = useRideHistoryQuery({
    limit: RECENT_LIMIT,
  });
  const rides = data ?? [];

  return (
    <section className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[18px] font-bold text-fg-primary">
          최근 이용 기록
        </h2>
        <Link
          href="/ride-history"
          className="text-[13px] font-bold text-fg-point hover:underline"
        >
          전체보기
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <RideListSkeleton />
        ) : isError ? (
          <RideListMessage text="이용 기록을 불러오지 못했어요." />
        ) : rides.length === 0 ? (
          <RideListMessage text="아직 이용 기록이 없어요." />
        ) : (
          rides.map((ride) => <RideCard key={ride.id} ride={ride} />)
        )}
      </div>
    </section>
  );
}

function RideListMessage({ text }: { text: string }) {
  return (
    <div className="flex w-full items-center justify-center rounded-3xl bg-bg-normal px-5 py-10 text-[13px] text-fg-tertiary shadow-sm">
      {text}
    </div>
  );
}

function RideListSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, i) => (
        <div
          key={i}
          className="h-[148px] w-full animate-pulse rounded-3xl bg-bg-normal shadow-sm"
        />
      ))}
    </>
  );
}
