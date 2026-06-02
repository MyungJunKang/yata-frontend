import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const body = await req.json().catch(() => null);
  const res = await backendFetch(`/rooms/${params.id}/settlement/confirm`, {
    method: "POST",
    headers: getAuthHeader(),
    json: body ?? {},
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
