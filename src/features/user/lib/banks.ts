/**
 * 정산 계좌 등록·수정 시 사용하는 은행 목록.
 * 회원가입 step3 와 마이페이지 프로필 수정에서 공유한다.
 */
export const BANKS = [
  "KB국민은행",
  "신한은행",
  "우리은행",
  "하나은행",
  "NH농협은행",
  "카카오뱅크",
  "토스뱅크",
  "SC제일은행",
  "IBK기업은행",
  "케이뱅크",
  "Sh수협은행",
  "씨티은행",
] as const;

export const BANK_OPTIONS = BANKS.map((b) => ({ label: b, value: b }));
