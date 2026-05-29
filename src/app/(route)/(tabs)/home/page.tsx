import { EmptyRoomsCta } from "@/features/home/components/empty-rooms-cta";
import { HomeHeader } from "@/features/home/components/home-header";
import { RouteCard } from "@/features/home/components/route-card";
import { SectionHeader } from "@/features/home/components/section-header";
import {
  MOCK_MATCH_COUNT,
  MOCK_ROOMS,
  MOCK_ROUTE,
} from "@/features/home/lib/mock-data";
import { RoomCard } from "@/features/rooms/components/room-card";

export default function HomePage() {
  return (
    <div className="flex w-full flex-col gap-5 pb-6">
      <HomeHeader />
      <RouteCard from={MOCK_ROUTE.from} to={MOCK_ROUTE.to} />
      <SectionHeader
        title="매칭 가능한 방"
        pillLabel={`${MOCK_MATCH_COUNT}명 매칭 중`}
      />
      <div className="flex flex-col gap-3">
        {MOCK_ROOMS.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
      <EmptyRoomsCta />
    </div>
  );
}
