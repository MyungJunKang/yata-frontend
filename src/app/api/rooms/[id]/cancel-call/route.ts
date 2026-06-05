import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const res = await backendFetch(`/rooms/${params.id}/cancel-call`, {
    method: "POST",
    headers: getAuthHeader(),
  });
  const body = await res.json().catch(() => null);
  return NextResponse.json(body, { status: res.status });
}
