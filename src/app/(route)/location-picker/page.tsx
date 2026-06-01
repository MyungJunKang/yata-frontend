import { notFound } from "next/navigation";

import { LocationPicker } from "@/features/location/components/location-picker";

type Props = {
  searchParams: { kind?: string };
};

export default function LocationPickerPage({ searchParams }: Props) {
  const kind = searchParams.kind;
  if (kind !== "from" && kind !== "to") notFound();
  return <LocationPicker kind={kind} />;
}
