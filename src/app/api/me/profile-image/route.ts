import { NextResponse } from "next/server";

import { getAuthHeader } from "@/lib/bff-auth";

/**
 * 프로필 사진 업로드 — multipart/form-data 를 백엔드로 그대로 패스스루.
 * (backendFetch 는 body 를 받지 않으므로 여기서는 fetch 직접 사용)
 */
export async function POST(req: Request) {
  const formData = await req.formData();
  const url = `${process.env.API_BASE_URL}/me/profile-image`;
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
