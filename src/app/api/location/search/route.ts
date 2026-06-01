import { NextResponse } from "next/server";

import type {
  LocationResult,
  SearchLocationResponse,
} from "@/features/location/api/location.types";

type KakaoKeywordResponse = {
  documents: Array<{
    id: string;
    place_name: string;
    road_address_name?: string;
    address_name: string;
    x: string; // lng
    y: string; // lat
    category_group_name?: string;
  }>;
};

const KAKAO_KEY = process.env.KAKAO_REST_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  if (!query) {
    return NextResponse.json<SearchLocationResponse>({ results: [] });
  }

  if (!KAKAO_KEY) {
    return NextResponse.json(
      { message: "Kakao REST key is not configured" },
      { status: 500 },
    );
  }

  const res = await fetch(
    `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=15`,
    {
      headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
      cache: "no-store",
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "검색에 실패했어요." },
      { status: res.status },
    );
  }

  const data = (await res.json()) as KakaoKeywordResponse;
  const results: LocationResult[] = data.documents.map((d) => ({
    id: d.id,
    name: d.place_name,
    address: d.road_address_name || d.address_name,
    lat: Number(d.y),
    lng: Number(d.x),
    category: d.category_group_name,
  }));

  return NextResponse.json<SearchLocationResponse>({ results });
}
