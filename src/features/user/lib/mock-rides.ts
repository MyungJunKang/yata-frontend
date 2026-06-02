// TODO: 백엔드 ride-history 엔드포인트 합의 후 실제 데이터로 교체.
// 합의 후보 스펙: GET /api/me/rides?limit=N → { rides: RecentRide[] }

export type RecentRide = {
  id: string;
  startPoint: string;
  endPoint: string;
  status: "completed" | "cancelled";
  /** ISO string */
  departAt: string;
  /** 본인 부담 (원) */
  personalFare: number;
};

export const MOCK_RECENT_RIDES: RecentRide[] = [
  {
    id: "ride-1",
    startPoint: "숭실대학교 정문",
    endPoint: "상도역 1번 출구",
    status: "completed",
    departAt: "2026-04-24T14:20:00.000Z",
    personalFare: 3400,
  },
  {
    id: "ride-2",
    startPoint: "강남역 10번 출구",
    endPoint: "숭실대학교 정보과학관",
    status: "completed",
    departAt: "2026-04-22T22:45:00.000Z",
    personalFare: 8900,
  },
];
