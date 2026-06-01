import { NextResponse } from "next/server";

import type {
  NearbyPlace,
  NearbyPlacesResponse,
} from "@/features/location/api/location.types";

type KakaoCategoryResponse = {
  documents: Array<{
    id: string;
    place_name: string;
    road_address_name?: string;
    address_name: string;
    category_group_name?: string;
    distance?: string; // 단위: m, x/y 가 같이 전달된 경우만
    x: string; // lng
    y: string; // lat
  }>;
};

const KAKAO_KEY = process.env.KAKAO_REST_KEY;

// 자주 마주치는 업체 카테고리. 카카오 category_group_code 기준.
const CATEGORY_CODES = ["FD6", "CE7", "MT1", "CS2", "SW8", "BK9"] as const;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = Math.min(
    Math.max(Number(searchParams.get("radius") ?? "300") || 300, 5),
    1000,
  );
  const limit = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "10") || 10, 1),
    30,
  );

  if (!lat || !lng) {
    return NextResponse.json({ message: "lat/lng required" }, { status: 400 });
  }
  if (!KAKAO_KEY) {
    return NextResponse.json<NearbyPlacesResponse>({ places: [] });
  }

  const headers = { Authorization: `KakaoAK ${KAKAO_KEY}` };
  const perCategorySize = Math.min(limit, 5);
  const results = await Promise.all(
    CATEGORY_CODES.map(async (code) => {
      const url =
        `https://dapi.kakao.com/v2/local/search/category.json` +
        `?category_group_code=${code}` +
        `&x=${lng}&y=${lat}` +
        `&radius=${radius}` +
        `&sort=distance&size=${perCategorySize}`;
      try {
        const res = await fetch(url, { headers, cache: "no-store" });
        if (!res.ok) return [];
        const data = (await res.json()) as KakaoCategoryResponse;
        return data.documents;
      } catch {
        return [];
      }
    }),
  );

  const merged = results
    .flat()
    .map((d) => ({
      id: d.id,
      name: d.place_name,
      address: d.road_address_name || d.address_name,
      category: d.category_group_name ?? "",
      lat: Number(d.y),
      lng: Number(d.x),
      distance: Number(d.distance ?? Number.POSITIVE_INFINITY),
    }))
    .filter((p) => Number.isFinite(p.distance))
    .sort((a, b) => a.distance - b.distance);

  // id 중복 제거 (다른 카테고리에서 같은 place 가 나올 수 있음)
  const seen = new Set<string>();
  const places: NearbyPlace[] = [];
  for (const p of merged) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    const { distance: _omit, ...rest } = p;
    void _omit;
    places.push(rest);
    if (places.length >= limit) break;
  }

  return NextResponse.json<NearbyPlacesResponse>(
    { places },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
