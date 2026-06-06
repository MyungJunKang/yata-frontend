"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { AlertTriangle } from "lucide-react";

import { ActiveRoomBanner } from "@/features/home/components/active-room-banner";
import { EmptyRoomsCta } from "@/features/home/components/empty-rooms-cta";
import { HomeHeader } from "@/features/home/components/home-header";
import { RouteCard } from "@/features/home/components/route-card";
import { SectionHeader } from "@/features/home/components/section-header";
import { useStatsSummaryQuery } from "@/features/home/api/use-home";
import {
  fromLocationAtom,
  toLocationAtom,
} from "@/features/location/store/location-atoms";
import { useRoomsQuery } from "@/features/rooms/api/use-rooms";
import type { GetRoomsParams } from "@/features/rooms/api/room.types";
import { RoomCard } from "@/features/rooms/components/room-card";
import { useActiveRoomQuery } from "@/features/user/api/use-user";

export default function HomePage() {
  const router = useRouter();
  const [fromLocation, setFromLocation] = useAtom(fromLocationAtom);
  const [toLocation, setToLocation] = useAtom(toLocationAtom);

  // 선택한 출발/도착 좌표로 방 목록 필터(반경 1km). 좌표가 바뀌면(선택·교환)
  // 쿼리 키가 바뀌어 TanStack Query 가 자동 refetch 한다.
  const roomParams = useMemo<GetRoomsParams>(
    () => ({
      ...(fromLocation
        ? { startLat: fromLocation.lat, startLng: fromLocation.lng }
        : {}),
      ...(toLocation
        ? { endLat: toLocation.lat, endLng: toLocation.lng }
        : {}),
    }),
    [fromLocation, toLocation],
  );

  const { data: rooms, isLoading, isError } = useRoomsQuery(roomParams);
  const activeRoomQuery = useActiveRoomQuery();
  const statsQuery = useStatsSummaryQuery();

  const activeRoom = activeRoomQuery.data?.room ?? null;
  const hasActiveRoom = !!activeRoom;

  const matchCount = statsQuery.data?.activeMatches ?? rooms?.length;

  // 출발/도착지는 기본값 없이 비워둠 — 미선택 시 placeholder 표시
  const fromLabel = fromLocation?.name;
  const toLabel = toLocation?.name;

  const handleSwap = () => {
    setFromLocation(toLocation);
    setToLocation(fromLocation);
  };

  // 출발·도착지를 모두 비우면 좌표 필터가 사라져 전체 방 목록으로 refetch
  const handleReset = () => {
    setFromLocation(null);
    setToLocation(null);
  };

  return (
    <div className="flex w-full flex-col gap-5 px-5 pb-6">
      <HomeHeader />

      {/* 참여 중인 방이 있으면 최상단 배너 + 노란 경고 */}
      {hasActiveRoom && (
        <div className="flex flex-col gap-3">
          <ActiveRoomBanner room={activeRoom} />
          <div className="flex items-center gap-2 rounded-xl bg-status-pending-bg px-3.5 py-2.5 text-caption-1 font-bold text-status-pending-strong">
            <AlertTriangle className="size-3.5 shrink-0" />
            기존 매칭이 끝나야 새 방에 참여할 수 있어요
          </div>
        </div>
      )}

      <RouteCard
        from={fromLabel}
        to={toLabel}
        onSwap={handleSwap}
        onReset={handleReset}
        onPickFrom={() => router.push("/location-picker?kind=from")}
        onPickTo={() => router.push("/location-picker?kind=to")}
      />
      <SectionHeader
        title="매칭 가능한 방"
        pillLabel={
          matchCount !== undefined ? `${matchCount}명 매칭 중` : undefined
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
            <RoomCard key={room.id} room={room} isLocked={hasActiveRoom} />
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
    <div className="flex animate-pulse flex-col gap-3.5 rounded-lg bg-bg-normal p-[18px] shadow-sm">
      <div className="flex items-center gap-4">
        <div className="size-16 shrink-0 rounded-lg bg-bg-subtle" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-3 w-20 rounded bg-bg-subtle" />
          <div className="h-4 w-32 rounded bg-bg-subtle" />
          <div className="h-3 w-40 rounded bg-bg-subtle" />
        </div>
      </div>
      <div className="h-px w-full bg-stroke-thin" />
      <div className="flex items-end justify-between">
        <div className="flex flex-col gap-1">
          <div className="h-3 w-14 rounded bg-bg-subtle" />
          <div className="h-5 w-24 rounded bg-bg-subtle" />
        </div>
        <div className="h-10 w-24 rounded-md bg-bg-subtle" />
      </div>
    </div>
  );
}
