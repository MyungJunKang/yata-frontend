import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const backendRes = await backendFetch("/auth/password/reset", {
    method: "POST",
    json: body,
  });

  const data = (await backendRes.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!backendRes.ok) {
    return NextResponse.json(
      data ?? { message: "비밀번호 재설정에 실패했어요." },
      { status: backendRes.status || 500 },
    );
  }

  return NextResponse.json(data ?? { ok: true });
}
