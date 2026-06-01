import { NextResponse } from "next/server";

import type { ReverseGeocodeResponse } from "@/features/location/api/location.types";

type KakaoReverseResponse = {
  documents: Array<{
    road_address?: { address_name: string } | null;
    address?: { address_name: string } | null;
  }>;
};

const KAKAO_KEY = process.env.KAKAO_REST_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      { message: "lat/lng required" },
      { status: 400 },
    );
  }
  if (!KAKAO_KEY) {
    return NextResponse.json(
      { message: "Kakao REST key is not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
      cache: "no-store",
    },
  );
  if (!res.ok) {
    return NextResponse.json<ReverseGeocodeResponse>({ address: null });
  }

  const data = (await res.json()) as KakaoReverseResponse;
  const first = data.documents[0];
  const address =
    first?.road_address?.address_name ?? first?.address?.address_name ?? null;

  return NextResponse.json<ReverseGeocodeResponse>(
    { address },
    {
      headers: {
        // 같은 좌표에 대한 응답은 5분 캐시 (Vercel CDN 절약)
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
