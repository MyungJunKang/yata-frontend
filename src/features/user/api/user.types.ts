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
