import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";

// 학과 목록 — 공개 엔드포인트(인증 불필요, 회원가입 단계에서 호출).
export async function GET() {
  const res = await backendFetch("/meta/departments", { method: "GET" });
  const body = await res.json().catch(() => null);
  return NextResponse.json(body, { status: res.status });
}
