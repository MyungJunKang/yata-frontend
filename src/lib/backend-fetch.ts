const BACKEND_URL = process.env.API_BASE_URL;

if (!BACKEND_URL && process.env.NODE_ENV !== "production") {
  // 개발 시 .env 누락 빠르게 알아채려고 콘솔 경고
  console.warn("[backend-fetch] API_BASE_URL 환경변수가 비어있습니다.");
}

type BackendFetchOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
};

/** 서버사이드(BFF Route Handler / middleware)에서 실제 백엔드를 부를 때만 사용. */
export async function backendFetch(
  path: string,
  opts: BackendFetchOptions = {},
): Promise<Response> {
  const { json, headers, ...rest } = opts;
  const finalHeaders = new Headers(headers);
  finalHeaders.set("Accept", "application/json");
  if (json !== undefined && !finalHeaders.has("Content-Type")) {
    finalHeaders.set("Content-Type", "application/json");
  }
  return fetch(`${BACKEND_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    // 서버사이드 호출이므로 cache는 명시적으로 no-store
    cache: "no-store",
  });
}
