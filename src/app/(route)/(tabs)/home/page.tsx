"use client";

import { EmptyRoomsCta } from "@/features/home/components/empty-rooms-cta";
import { HomeHeader } from "@/features/home/components/home-header";
import { RouteCard } from "@/features/home/components/route-card";
import { SectionHeader } from "@/features/home/components/section-header";
import { MOCK_ROUTE } from "@/features/home/lib/mock-data";
import { useRoomsQuery } from "@/features/rooms/api/use-rooms";
import { RoomCard } from "@/features/rooms/components/room-card";

export default function HomePage() {
  const { data: rooms, isLoading, isError } = useRoomsQuery();

  return (
    <div className="flex w-full flex-col gap-5 px-5 pb-6">
      <HomeHeader />
      <RouteCard from={MOCK_ROUTE.from} to={MOCK_ROUTE.to} />
      <SectionHeader
        title="매칭 가능한 방"
        pillLabel={
          rooms ? `${rooms.length}명 매칭 중` : undefined
        }
      />

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <RoomCardSkeleton />
          <RoomCardSkeleton />
        </div>
      ) : isError ? (
        <p className="rounded-md bg-red-100 px-4 py-3 text-body-2 text-fg-warning">
          방 목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.
        </p>
      ) : rooms && rooms.length > 0 ? (
        <div className="flex flex-col gap-3">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      ) : (
        <p className="rounded-md bg-bg-subtle px-4 py-6 text-center text-body-2 text-fg-secondary">
          매칭 가능한 방이 아직 없어요.
        </p>
      )}

      <EmptyRoomsCta />
    </div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-lg bg-bg-normal p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="size-12 shrink-0 rounded-md bg-bg-subtle" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-20 rounded bg-bg-subtle" />
          <div className="h-4 w-32 rounded bg-bg-subtle" />
          <div className="h-3 w-40 rounded bg-bg-subtle" />
        </div>
      </div>
      <div className="flex items-end justify-between border-t border-stroke-thin pt-3">
        <div className="flex flex-col gap-1">
          <div className="h-3 w-14 rounded bg-bg-subtle" />
          <div className="h-5 w-24 rounded bg-bg-subtle" />
        </div>
        <div className="h-10 w-24 rounded-md bg-bg-subtle" />
      </div>
    </div>
  );
}
