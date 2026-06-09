import { NextResponse, type NextRequest } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

const AUTH_PUBLIC_PATHS = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
];

function isAuthPublicPath(pathname: string): boolean {
  return AUTH_PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasToken = !!req.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 루트(/): 인증 사용자는 곧장 /home, 미인증은 splash 잠시 보여주고 자체 라우팅
  if (pathname === "/") {
    if (hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 인증 페이지(로그인/회원가입/비밀번호찾기): 이미 로그인된 사용자는 홈으로
  if (isAuthPublicPath(pathname)) {
    if (hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 그 외 모든 페이지: 토큰 없으면 로그인으로
  if (!hasToken) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// 정적 파일과 BFF 라우트는 미들웨어 우회. `/uploads/*` 는 익명 이미지 패스스루
// 라우트라 인증 리다이렉트에서 제외.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|images|api|uploads).*)",
  ],
};
