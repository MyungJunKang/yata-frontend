import { api } from "@/lib/api-client";

import type {
  CreateSettlementBody,
  Settlement,
} from "@/features/rooms/api/settlement.types";

export const getSettlement = (roomId: string) =>
  api.get<Settlement>(`/api/rooms/${roomId}/settlement`);

export const createSettlement = (roomId: string, body: CreateSettlementBody) =>
  api.post<Settlement>(`/api/rooms/${roomId}/settlement`, { json: body });
