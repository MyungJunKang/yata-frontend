import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

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
