"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  confirmSettlementPayment,
  createSettlement,
  getSettlement,
  markSettlementPaid,
} from "@/features/rooms/api/settlement";
import { roomKeys } from "@/features/rooms/api/query-keys";
import { messageKeys } from "@/features/messages/api/query-keys";
import type { CreateSettlementBody } from "@/features/rooms/api/settlement.types";
import { ApiError } from "@/lib/api-client";

export function useSettlementQuery(roomId: string | null) {
  return useQuery({
    queryKey: roomKeys.settlement(roomId ?? ""),
    queryFn: () => {
      if (!roomId) throw new Error("roomId missing");
      return getSettlement(roomId);
    },
    enabled: !!roomId,
    // 정산 공지 없으면 404 — 재시도 안 함
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useCreateSettlementMutation(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSettlementBody) => createSettlement(roomId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.settlement(roomId) });
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}

/** 멤버: 송금 완료 표시 */
export function useMarkSettlementPaidMutation(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markSettlementPaid(roomId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.settlement(roomId) });
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}

/** 호스트: 특정 멤버의 수령 확인 */
export function useConfirmSettlementPaymentMutation(roomId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => confirmSettlementPayment(roomId, userId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roomKeys.settlement(roomId) });
      qc.invalidateQueries({ queryKey: messageKeys.list(roomId) });
    },
  });
}
