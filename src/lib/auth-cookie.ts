import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

export const AUTH_COOKIE_NAME = "yata_token";

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getAuthCookieOptions(
  maxAgeSeconds?: number,
): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds ?? DEFAULT_MAX_AGE_SECONDS,
  };
}

export function getRemainingSecondsFromJwt(token: string): number | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf8"),
    ) as { exp?: unknown };
    if (typeof payload.exp !== "number") return null;
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : null;
  } catch {
    return null;
  }
}
