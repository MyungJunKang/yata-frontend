import { NextResponse } from "next/server";

import { backendFetch } from "@/lib/backend-fetch";
import { getAuthHeader } from "@/lib/bff-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const res = await backendFetch(`/rooms/${params.id}/settlement`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  const body = await res.json().catch(() => null);
  return NextResponse.json(body, { status: res.status });
}

/**
 * 정산 생성 — multipart/form-data 또는 JSON 모두 허용.
 * - multipart 인 경우 FormData 그대로 백엔드로 패스스루 (image 바이너리 포함).
 * - 그 외 (JSON) 는 기존 backendFetch 로 전달.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const contentType = req.headers.get("content-type") || "";

  if (contentType.startsWith("multipart/form-data")) {
    const formData = await req.formData();
    const url = `${process.env.API_BASE_URL}/rooms/${params.id}/settlement`;
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

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }
  const res = await backendFetch(`/rooms/${params.id}/settlement`, {
    method: "POST",
    headers: getAuthHeader(),
    json: body,
  });
  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
