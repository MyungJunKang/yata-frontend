export type RoomCallStatus = "before" | "completed" | "closed";

export type RoomSummary = {
  id: string;
  host: string;
  verified: boolean;
  callStatus: RoomCallStatus;
  members: number;
  capacity: number;
  departAt: string;
  farePerPerson: number;
  memberColors: string[];
};

export const MOCK_ROUTE = {
  from: "숭실대학교 정문",
  to: "강남역",
};

export const MOCK_MATCH_COUNT = 12;

export const MOCK_ROOMS: RoomSummary[] = [
  {
    id: "room-1",
    host: "김숭실",
    verified: true,
    callStatus: "before",
    members: 2,
    capacity: 4,
    departAt: "오전 10:24",
    farePerPerson: 4500,
    memberColors: ["#FFB8B8", "#A893FF"],
  },
  {
    id: "room-2",
    host: "이아이티",
    verified: false,
    callStatus: "closed",
    members: 1,
    capacity: 4,
    departAt: "오전 10:32",
    farePerPerson: 4200,
    memberColors: ["#FFD75A"],
  },
  {
    id: "room-3",
    host: "박지우",
    verified: true,
    callStatus: "before",
    members: 3,
    capacity: 4,
    departAt: "오전 10:48",
    farePerPerson: 4750,
    memberColors: ["#86EFAC", "#FFB8B8", "#A893FF"],
  },
];
