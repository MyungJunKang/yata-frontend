import { api, ApiError } from "@/lib/api-client";

import type {
  CreateSettlementBody,
  Settlement,
  SettlementMemberStatus,
} from "@/features/rooms/api/settlement.types";

/**
 * 백엔드가 status 를 대문자(PAID) 또는 다른 형태로 보낼 수 있어 클라이언트 enum 으로 정규화.
 * - "confirmed" 또는 confirm 으로 시작 → "confirmed"
 * - "paid" 또는 paid 로 시작 → "paid"
 * - 그 외 → "unpaid"
 */
function normalizeStatus(raw: unknown): SettlementMemberStatus {
  const s = typeof raw === "string" ? raw.toLowerCase() : "";
  if (s === "confirmed" || s.startsWith("confirm")) return "confirmed";
  if (s === "paid" || s.startsWith("paid")) return "paid";
  return "unpaid";
}

function normalizeSettlement(s: Settlement): Settlement {
  if (!s.members) return s;
  return {
    ...s,
    members: s.members.map((m) => ({ ...m, status: normalizeStatus(m.status) })),
  };
}

export const getSettlement = async (roomId: string): Promise<Settlement> => {
  const data = await api.get<Settlement>(`/api/rooms/${roomId}/settlement`);
  return normalizeSettlement(data);
};

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
  return normalizeSettlement(data as Settlement);
};
