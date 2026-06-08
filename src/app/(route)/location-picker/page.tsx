import { notFound } from "next/navigation";

import { LocationPicker } from "@/features/location/components/location-picker";

type Props = {
  searchParams: { kind?: string; target?: string };
};

export default function LocationPickerPage({ searchParams }: Props) {
  const kind = searchParams.kind;
  if (kind !== "from" && kind !== "to") notFound();
  // 기본은 방 검색 — create-room 에서만 명시적으로 target=create 를 넘겨준다.
  const target = searchParams.target === "create" ? "create" : "search";
  return <LocationPicker kind={kind} target={target} />;
}
