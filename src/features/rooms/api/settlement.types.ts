export type SettlementMemberStatus = "pending" | "paid";

export type SettlementMember = {
  userId: string;
  name: string;
  status: SettlementMemberStatus;
  paidAt: string | null;
};

export type Settlement = {
  roomId: string;
  totalFare: number;
  perPersonFare: number;
  capacity: number;
  hostAccount: {
    bank: string;
    accountNumber: string;
    holder: string;
  } | null;
  members: SettlementMember[];
  createdAt: string;
};

// TODO: 백엔드가 어떤 필드를 필요로 하는지 확인 후 보강.
// 현재 POST /rooms/:id/settlement 는 totalFare/actualFare/amount 등 단독 / 조합 모두
// MISSING_FIELDS 응답 → 추가 필드(예: bankAccountId, paymentMethod 등) 합의 필요.
export type CreateSettlementBody = {
  totalFare: number;
};
