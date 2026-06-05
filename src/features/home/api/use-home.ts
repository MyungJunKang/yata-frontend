"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getPopularDestinations,
  getStatsSummary,
} from "@/features/home/api/home";
import { homeKeys } from "@/features/home/api/query-keys";
import type { GetPopularDestinationsParams } from "@/features/home/api/home.types";

export function usePopularDestinationsQuery(
  params: GetPopularDestinationsParams = {},
) {
  return useQuery({
    queryKey: homeKeys.popularDestinations(params),
    queryFn: () => getPopularDestinations(params),
  });
}

export function useStatsSummaryQuery() {
  return useQuery({
    queryKey: homeKeys.statsSummary(),
    queryFn: getStatsSummary,
  });
}
