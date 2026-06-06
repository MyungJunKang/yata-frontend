import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

export async function GET() {
  const res = await backendFetch("/me", {
    method: "GET",
    headers: getAuthHeader(),
  });
  const body = await res.json().catch(() => null);
  return NextResponse.json(body, { status: res.status });
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }
  const res = await backendFetch("/me", {
    method: "PATCH",
    headers: getAuthHeader(),
    json: body,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const res = await backendFetch("/me", {
    method: "DELETE",
    headers: getAuthHeader(),
    json: body,
  });

  // 탈퇴 성공 → 세션 종료를 위해 인증 쿠키 제거
  if (res.ok) {
    const ok = new NextResponse(null, { status: 204 });
    ok.cookies.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return ok;
  }

  // 실패(예: 401 비밀번호 불일치) → 백엔드 응답 그대로 전달
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
