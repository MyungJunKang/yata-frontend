import { NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
  getRemainingSecondsFromJwt,
} from "@/lib/auth-cookie";
import { backendFetch } from "@/lib/backend-fetch";

type BackendAuthResponse = {
  token: string;
  user: unknown;
};

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const backendRes = await backendFetch("/auth/signup", {
    method: "POST",
    json: body,
  });

  const data = (await backendRes.json().catch(() => null)) as
    | BackendAuthResponse
    | { message?: string }
    | null;

  if (!backendRes.ok || !data || !("token" in data) || !data.token) {
    return NextResponse.json(
      data ?? { message: "회원가입에 실패했어요." },
      { status: backendRes.status || 500 },
    );
  }

  const res = NextResponse.json({ user: data.user });
  res.cookies.set(AUTH_COOKIE_NAME, data.token, {
    ...getAuthCookieOptions(
      getRemainingSecondsFromJwt(data.token) ?? undefined,
    ),
  });
  return res;
}
