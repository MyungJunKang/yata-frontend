import { useQuery } from "@tanstack/react-query";

import { getFareEstimate } from "@/features/fare/api/fare";
import type { FareEstimateRequest } from "@/features/fare/api/fare.types";

type Options = {
  enabled?: boolean;
};

/**
 * 출발/도착/출발시각 변경 시 자동으로 요금 재산정.
 * enabled=false 면 호출 안 함.
 */
export function useFareEstimate(
  body: FareEstimateRequest | null,
  { enabled = true }: Options = {},
) {
  return useQuery({
    queryKey: ["fare-estimate", body],
    queryFn: () => {
      if (!body) throw new Error("fare estimate body missing");
      return getFareEstimate(body);
    },
    enabled: !!body && enabled,
    staleTime: 5 * 60_000,
  });
}
