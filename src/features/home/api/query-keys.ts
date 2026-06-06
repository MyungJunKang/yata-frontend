import type { GetPopularDestinationsParams } from "@/features/home/api/home.types";

export const homeKeys = {
  all: ["home"] as const,
  popularDestinations: (params: GetPopularDestinationsParams) =>
    [...homeKeys.all, "popular-destinations", params] as const,
  statsSummary: () => [...homeKeys.all, "stats-summary"] as const,
};
