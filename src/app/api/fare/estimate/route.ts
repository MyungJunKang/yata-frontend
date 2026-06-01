import { NextResponse } from "next/server";

import type {
  FareEstimateResponse,
} from "@/features/fare/api/fare.types";

type KakaoDirectionsResponse = {
  routes: Array<{
    result_code: number;
    result_msg?: string;
    summary?: { distance: number; duration: number };
  }>;
};

const KAKAO_KEY = process.env.KAKAO_REST_KEY;

// 서울 택시 요금 정책 (2024 기준, 정책 변경 시 이 상수만 갱신)
const BASE_FARE = 4_800; // 기본요금 (원)
const BASE_DISTANCE_M = 1_600; // 기본거리 (m)
const DISTANCE_UNIT_M = 131; // 거리 가산 단위
const DISTANCE_UNIT_FARE = 100; // 거리 가산 단위당 요금
const TIME_UNIT_SEC = 30; // 시간 가산 단위
const TIME_UNIT_FARE = 100; // 시간 가산 단위당 요금
const LATE_NIGHT_SURCHARGE = 1.2; // 심야 22~04시 20% 할증

function isLateNightAt(d: Date): boolean {
  const h = d.getHours();
  return h >= 22 || h < 4;
}

function roundUpTo100(n: number): number {
  return Math.ceil(n / 100) * 100;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fromLat = Number(searchParams.get("fromLat"));
  const fromLng = Number(searchParams.get("fromLng"));
  const toLat = Number(searchParams.get("toLat"));
  const toLng = Number(searchParams.get("toLng"));
  const departAtRaw = searchParams.get("departAt") ?? "";

  if (
    !Number.isFinite(fromLat) ||
    !Number.isFinite(fromLng) ||
    !Number.isFinite(toLat) ||
    !Number.isFinite(toLng)
  ) {
    return NextResponse.json(
      { message: "fromLat/fromLng/toLat/toLng required" },
      { status: 400 },
    );
  }
  if (!KAKAO_KEY) {
    return NextResponse.json(
      { message: "Kakao REST key is not configured" },
      { status: 500 },
    );
  }

  const url =
    `https://apis-navi.kakaomobility.com/v1/directions` +
    `?origin=${fromLng},${fromLat}` +
    `&destination=${toLng},${toLat}`;

  const res = await fetch(url, {
    headers: { Authorization: `KakaoAK ${KAKAO_KEY}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json(
      { message: "경로 조회에 실패했어요." },
      { status: res.status },
    );
  }
  const data = (await res.json()) as KakaoDirectionsResponse;
  const summary = data.routes?.[0]?.summary;
  if (!summary) {
    return NextResponse.json(
      { message: "경로를 찾지 못했어요." },
      { status: 404 },
    );
  }

  const distance = summary.distance;
  const duration = summary.duration;

  // 거리 요금: 기본거리 초과 부분만 가산
  const extraDistance = Math.max(0, distance - BASE_DISTANCE_M);
  const distanceFare =
    Math.ceil(extraDistance / DISTANCE_UNIT_M) * DISTANCE_UNIT_FARE;
  // 시간 요금: 전체 소요 시간에 대해 가산 (Seoul 정책 단순 근사)
  const timeFare = Math.ceil(duration / TIME_UNIT_SEC) * TIME_UNIT_FARE;

  const departDate = departAtRaw ? new Date(departAtRaw) : new Date();
  const isLateNight =
    Number.isFinite(departDate.getTime()) && isLateNightAt(departDate);
  const surcharge = isLateNight ? LATE_NIGHT_SURCHARGE : 1;

  const raw = (BASE_FARE + distanceFare + timeFare) * surcharge;
  const totalFare = roundUpTo100(raw);

  const body: FareEstimateResponse = {
    distance,
    duration,
    totalFare,
    isLateNight,
    breakdown: {
      base: BASE_FARE,
      distanceFare,
      timeFare,
      surchargeMultiplier: surcharge,
    },
  };

  return NextResponse.json<FareEstimateResponse>(body, {
    headers: {
      "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
    },
  });
}
