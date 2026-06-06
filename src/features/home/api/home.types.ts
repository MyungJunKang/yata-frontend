/** GET /destinations/popular 의 PopularDestination (swagger) */
export type PopularDestination = {
  name: string;
  count: number;
};

/** GET /stats/summary 응답 (swagger) */
export type StatsSummary = {
  activeMatches: number;
  avgDistanceKm: number;
  trustScore: number;
};

export type GetPopularDestinationsParams = {
  limit?: number;
};
