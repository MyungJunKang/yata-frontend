import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

/** Route Handler 안에서 cookie 의 JWT 를 Bearer 헤더로 변환. */
export function getAuthHeader(): Record<string, string> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
