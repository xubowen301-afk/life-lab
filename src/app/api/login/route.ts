import { NextRequest, NextResponse } from "next/server";

const AUTH_PASSWORD = "life-lab-2024";

export async function POST(req: NextRequest) {
  const { password } = await req.json();

  if (password === AUTH_PASSWORD) {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("life-lab-token", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30 // 30 天
    });
    return response;
  }

  return NextResponse.json({ error: "密码错误" }, { status: 401 });
}