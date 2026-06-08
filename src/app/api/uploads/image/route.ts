import { NextResponse } from "next/server";

import { getAuthHeader } from "@/lib/bff-auth";

/**
 * 범용 이미지 업로드 — 영수증·프로필 사진 등.
 * multipart/form-data 를 백엔드 `/uploads/image` 로 그대로 패스스루.
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const url = `${process.env.API_BASE_URL}/uploads/image`;
  const res = await fetch(url, {
    method: "POST",
    headers: getAuthHeader(),
    body: formData,
    cache: "no-store",
  });
  const text = await res.text();
  const data = text
    ? (() => {
        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      })()
    : null;
  return NextResponse.json(data, { status: res.status });
}
