import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("life-lab-token")?.value;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApi = req.nextUrl.pathname.startsWith("/api/");

  // API 没登录返回 401
  if (isApi && !token) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // 页面没登录跳转到登录页
  if (!isLoginPage && !isApi && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 已登录访问登录页，跳回首页
  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};