import { SettlementScreen } from "@/features/rooms/components/settlement-screen";

export default function SettlementPage({
  params,
}: {
  params: { id: string };
}) {
  return <SettlementScreen roomId={params.id} />;
}
