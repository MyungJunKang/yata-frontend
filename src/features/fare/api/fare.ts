import { api } from "@/lib/api-client";
import type {
  FareEstimateRequest,
  FareEstimateResponse,
} from "@/features/fare/api/fare.types";

export const getFareEstimate = (body: FareEstimateRequest) =>
  api.get<FareEstimateResponse>("/api/fare/estimate", { query: body });
