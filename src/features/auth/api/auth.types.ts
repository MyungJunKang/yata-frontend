import { UserGender, UserType } from "@/features/user/api/user.types";

export type SignInBody = {
  email: string;
  password: string;
};

/** BFF가 토큰을 httpOnly cookie 로 박은 뒤 클라이언트에게는 user 만 돌려준다. */
export type SignInResponse = {
  user: UserType;
};

export type SignUpBody = {
  name: string;
  email: string;
  phone: string;
  gender: UserGender;
  dept: string;
  year: string;
  password: string; // 8자리
};

export type SignUpResponse = SignInResponse;
