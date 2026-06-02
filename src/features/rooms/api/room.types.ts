import { UserGender } from "@/features/user/api/user.types";

export type GetRoomsParams = {
  from?: number;
  to?: number;
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
  genderPolicy: UserGender | "all";
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
  status: "pending";
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
  genderPolicy: UserGender | "all";
  expiresAt: string | null;
  archivedAt: string | null;
};

export type GetActiveRoomResponse = {
  room: ActiveRoom | null;
};
