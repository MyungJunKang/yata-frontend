import { RoomDetailScreen } from "@/features/rooms/components/room-detail-screen";

export default function RoomDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <RoomDetailScreen roomId={params.id} />;
}
