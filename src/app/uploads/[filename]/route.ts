import { NextResponse } from "next/server";

import { getAuthHeader } from "@/lib/bff-auth";

// 백엔드가 한글/공백/괄호가 포함된 원본 파일명을 그대로 저장하므로 문자 집합을 좁히면 400.
// 실제로 막아야 할 건 경로 트래버설(`..`)과 경로 구분자(`/`, `\`), 제어 문자뿐.
function isSafeFilename(name: string): boolean {
  if (!name) return false;
  if (name.includes("..")) return false;
  if (name.includes("/") || name.includes("\\")) return false;
  // null/control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1f]/.test(name)) return false;
  return true;
}

/**
 * 업로드 이미지 패스스루 — 백엔드 `/uploads/{filename}` 를 그대로 스트리밍.
 * UploadResult.url (`/uploads/...`) 을 클라이언트에서 그대로 <img src> 로 사용 가능.
 * 백엔드가 인증을 요구하므로 BFF 쿠키의 Bearer 토큰을 함께 전달.
 */
export async function GET(
  _req: Request,
  { params }: { params: { filename: string } },
) {
  const { filename } = params;
  if (!isSafeFilename(filename)) {
    return NextResponse.json({ message: "Invalid filename" }, { status: 400 });
  }
  const url = `${process.env.API_BASE_URL}/uploads/${encodeURIComponent(filename)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: getAuthHeader(),
    cache: "no-store",
  });
  if (!res.ok || !res.body) {
    return NextResponse.json(
      { message: "Not found" },
      { status: res.status || 404 },
    );
  }
  const headers = new Headers();
  const ct = res.headers.get("content-type");
  if (ct) headers.set("content-type", ct);
  // 업로드 자산은 immutable — 파일명이 타임스탬프 prefix 라 충돌 위험 낮음.
  headers.set("cache-control", "public, max-age=3600");
  return new Response(res.body, { status: 200, headers });
}
