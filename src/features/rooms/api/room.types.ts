import { UserGender } from "@/features/user/api/user.types";

export type GetRoomsParams = {
  from?: number;
  to?: number;
  limit?: number;
};

export type GetRoomsResponse = RoomType[];

export type CreateRoomBody = {
  startPoint: string;
  endPoint: string;
  departAt: string;
  capacity: number;
  genderPolicy: UserGender | "all";
  message: string;
};

export type RoomType = {
  id: string;
  host: {
    userId: string;
    name: string;
    avatarUrl: string | null;
    role: "host";
  };
  members: {
    avatarUrl: string | null;
  };
  joinedCount: number;
  maxCount: number;
  departAt: string;
  perPersonFare: number | null;
  status: "pending";
};
