import { api } from "@/lib/api-client";

import type {
  GetPopularDestinationsParams,
  PopularDestination,
  StatsSummary,
} from "./home.types";

export const getPopularDestinations = (
  params: GetPopularDestinationsParams = {},
) =>
  api.get<PopularDestination[]>("/api/destinations/popular", {
    query: params,
  });

export const getStatsSummary = () =>
  api.get<StatsSummary>("/api/stats/summary");
