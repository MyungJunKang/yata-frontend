export type UserGender = "male" | "female";

export type UserType = {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: UserGender;
  dept: string;
  year: string;
  profileImageUrl: string | null;
  isVerified: boolean;
  activeRoomId: string | null;
};

export type UserStatsResponse = {
  totalRides: number;
  savedAmountWon: number;
};

export type RideStatus = "completed" | "cancelled";

/** GET /me/ride-history 의 RideHistoryItem (swagger) */
export type RideHistoryItem = {
  id: string;
  startPoint: string;
  endPoint: string;
  /** ISO date-time, 미출발 등으로 null 가능 */
  departedAt: string | null;
  /** 본인 부담 (원), 정산 전이면 null 가능 */
  myFareWon: number | null;
  status: RideStatus;
};

export type GetRideHistoryParams = {
  limit?: number;
  /** 마지막 id (무한스크롤 커서) */
  cursor?: string;
};

/** PATCH /me body — 이름·전화·성별만 수정 가능 (프로필 이미지는 업로드 API 가 자체 저장) */
export type UpdateProfileBody = {
  name?: string;
  phone?: string;
  gender?: UserGender;
};

export type UpdateProfileResponse = {
  user: UserType;
};

/** GET·PATCH /me/payment-account 의 PaymentAccount (swagger) */
export type PaymentAccount = {
  bank: string;
  accountNumber: string;
  accountHolder: string;
};

/** POST /me/password body */
export type ChangePasswordBody = {
  currentPassword: string;
  /** 8자 이상 */
  newPassword: string;
};

export type WithdrawReason =
  | "no_longer_needed"
  | "privacy"
  | "found_alternative"
  | "other";

/** DELETE /me body — 회원 탈퇴 */
export type DeleteAccountBody = {
  password: string;
  reason: WithdrawReason;
  feedback?: string;
};

/** POST /me/profile-image · /uploads/image 의 업로드 결과 (swagger) */
export type UploadResult = {
  url: string;
  width: number | null;
  height: number | null;
  sizeBytes: number;
};
