import { api, ApiError } from "@/lib/api-client";

import type {
  CreateSettlementBody,
  Settlement,
} from "@/features/rooms/api/settlement.types";

export const getSettlement = (roomId: string) =>
  api.get<Settlement>(`/api/rooms/${roomId}/settlement`);

/** 멤버가 본인이 송금했음을 알림 */
export const markSettlementPaid = (roomId: string) =>
  api.post<unknown>(`/api/rooms/${roomId}/settlement/paid`);

/** 호스트가 특정 멤버의 수령을 확인 (toggle) — body.targetUserId */
export const confirmSettlementPayment = (
  roomId: string,
  targetUserId: string,
) =>
  api.post<unknown>(`/api/rooms/${roomId}/settlement/confirm`, {
    json: { targetUserId },
  });

/**
 * POST /api/rooms/[id]/settlement
 * 백엔드가 multipart/form-data 를 받으므로 FormData 로 전송.
 * image 가 있으면 그대로 첨부, payout 은 PaymentAccount JSON 문자열.
 */
export const createSettlement = async (
  roomId: string,
  body: CreateSettlementBody,
): Promise<Settlement> => {
  const fd = new FormData();
  fd.append("totalFare", String(body.totalFare));
  fd.append("perPersonAmount", String(body.perPersonAmount));
  fd.append("membersCount", String(body.membersCount));
  if (body.payout) fd.append("payout", body.payout);
  if (body.image) fd.append("image", body.image);

  const res = await fetch(`/api/rooms/${roomId}/settlement`, {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });

  const data = await res.text().then((t) => {
    if (!t) return null;
    try {
      return JSON.parse(t);
    } catch {
      return t;
    }
  });
  if (!res.ok) throw new ApiError(res.status, data);
  return data as Settlement;
};
