export type SettlementMemberStatus = "unpaid" | "paid" | "confirmed";

export type SettlementMember = {
  userId: string;
  name: string;
  status: SettlementMemberStatus;
  paidAt: string | null;
  confirmedAt: string | null;
};

export type PaymentAccount = {
  bank: string;
  accountNumber: string;
  holder: string;
};

export type Settlement = {
  announcementMessageId?: string;
  totalFare: number;
  perPersonAmount: number;
  /** 정산 대상 인원 (응답에 없는 경우도 있어 optional) */
  membersCount?: number;
  imageUrl?: string | null;
  members?: SettlementMember[];
  allConfirmed?: boolean;
  /** PaymentAccount JSON 문자열 — 파싱 필요 */
  payout?: string | null;
  createdAt?: string;
};

export type CreateSettlementBody = {
  totalFare: number;
  perPersonAmount: number;
  membersCount: number;
  /** PaymentAccount JSON.stringify(...) */
  payout?: string;
  /** 정산 영수증 이미지 (선택) */
  image?: File;
};
