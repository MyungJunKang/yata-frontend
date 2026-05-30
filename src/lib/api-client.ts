export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    const message =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as { message: unknown }).message)
        : `Request failed: ${status}`;
    super(message);
    this.name = "ApiError";
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type QueryValue = string | number | boolean | null | undefined;

export type ApiOptions = Omit<RequestInit, "body" | "method"> & {
  json?: unknown;
  query?: Record<string, QueryValue>;
};

// 클라이언트는 항상 same-origin `/api/*` (Next.js Route Handler / BFF) 로만 호출한다.
// 토큰은 httpOnly cookie 로 자동 전송되므로 Authorization 헤더는 붙이지 않는다.
function buildUrl(path: string, query?: ApiOptions["query"]): string {
  if (!query) return path;
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue;
    usp.set(k, String(v));
  }
  const qs = usp.toString();
  return qs ? `${path}?${qs}` : path;
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<T>(
  method: Method,
  path: string,
  opts: ApiOptions = {},
): Promise<T> {
  const { json, query, headers: extraHeaders, ...rest } = opts;
  const url = buildUrl(path, query);

  const headers = new Headers(extraHeaders);
  headers.set("Accept", "application/json");
  if (json !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...rest,
    method,
    headers,
    body: json !== undefined ? JSON.stringify(json) : undefined,
    // same-origin 호출이지만 httpOnly cookie 자동 전송을 명시
    credentials: "same-origin",
  });

  if (res.status === 401) {
    if (
      typeof window !== "undefined" &&
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }

  const body = await parseBody(res);
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}

export const api = {
  get: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>("GET", path, opts),
  post: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>("POST", path, opts),
  put: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>("PUT", path, opts),
  patch: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>("PATCH", path, opts),
  delete: <T = unknown>(path: string, opts?: ApiOptions) =>
    request<T>("DELETE", path, opts),
};
