/** 방 성별 정책 (서버 enum) — 상관없음 / 동성만 / 친구만 */
export type GenderPolicy = "all" | "same" | "friends";

export type GetRoomsParams = {
  /** 출발지 텍스트 검색 (정규식) */
  from?: string;
  /** 도착지 텍스트 검색 (정규식) */
  to?: string;
  /** 출발지 좌표 — 입력 시 반경 1km 필터 (startLng과 함께) */
  startLat?: number;
  startLng?: number;
  /** 도착지 좌표 — 입력 시 반경 1km 필터 (endLng과 함께) */
  endLat?: number;
  endLng?: number;
  limit?: number;
};

export type GetRoomsResponse = RoomType[];

export type CreateRoomBody = {
  startPoint: string;
  startLat: number;
  startLng: number;
  endPoint: string;
  endLat: number;
  endLng: number;
  departAt: string;
  capacity: number;
  genderPolicy: GenderPolicy;
  message: string;
  totalFare: number;
};

export type RoomMemberSummary = {
  avatarUrl: string | null;
};

export type RoomType = {
  id: string;
  host: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    role: "host";
  };
  members: RoomMemberSummary[];
  joinedCount: number;
  maxCount: number;
  departAt: string;
  perPersonFare: number | null;
  status: RoomCallStatus;
  startPoint?: string;
  endPoint?: string;
};

export type RoomCallStatus =
  | "pending"
  | "calling"
  | "called"
  | "settling"
  | "completed";

export type ActiveRoomMember = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  role: "host" | "member";
};

export type ActiveRoom = {
  id: string;
  title: string;
  startPoint: string;
  endPoint: string;
  departAt: string;
  joinedCount: number;
  maxCount: number;
  members: ActiveRoomMember[];
  callStatus: RoomCallStatus;
  genderPolicy: GenderPolicy;
  expiresAt: string | null;
  archivedAt: string | null;
};

export type GetActiveRoomResponse = {
  room: ActiveRoom | null;
};

export type ShareLocationBody = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export type CallStatusResponse = {
  callStatus: RoomCallStatus;
};
