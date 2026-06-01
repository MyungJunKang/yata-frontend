import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { backendFetch } from "@/lib/backend-fetch";

function getAuthHeader(): Record<string, string> {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qs = searchParams.toString();
  const backendRes = await backendFetch(`/rooms${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const body = await backendRes.json().catch(() => null);
  return NextResponse.json(body, { status: backendRes.status });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }
  const backendRes = await backendFetch("/rooms", {
    method: "POST",
    headers: getAuthHeader(),
    json: body,
  });
  const data = await backendRes.json().catch(() => null);
  return NextResponse.json(data, { status: backendRes.status });
}
