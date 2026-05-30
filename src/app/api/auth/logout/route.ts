import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { backendFetch } from "@/lib/backend-fetch";
import { cookies } from "next/headers";

export async function POST() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  // 백엔드 로그아웃 (실패해도 클라 쿠키는 무조건 비움)
  if (token) {
    await backendFetch("/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
