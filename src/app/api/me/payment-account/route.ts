import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

export async function GET() {
  const res = await backendFetch("/me/payment-account", {
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
  const res = await backendFetch("/me/payment-account", {
    method: "PATCH",
    headers: getAuthHeader(),
    json: body,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
