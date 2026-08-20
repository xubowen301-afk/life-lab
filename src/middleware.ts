import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("life-lab-token")?.value;
  const userId = token ? verifyToken(token)?.userId : null;
  const path = req.nextUrl.pathname;

  const isLoginPage = path === "/login";
  const isRegisterPage = path === "/register";
  const isAuthPage = isLoginPage || isRegisterPage;
  const isLoginApi = path === "/api/login";
  const isRegisterApi = path === "/api/register";
  const isApi = path.startsWith("/api/");

  // 认证 API 放行
  if (isLoginApi || isRegisterApi) {
    return NextResponse.next();
  }

  // API 没登录返回 401
  if (isApi && !userId) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // 页面没登录跳转到登录页
  if (!isAuthPage && !isApi && !userId) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 已登录访问登录/注册页，跳回首页
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"]
};