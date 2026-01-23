import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set("github_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // 배포 환경에서만 https 적용
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24, // 1일 유지
  });

  return NextResponse.json({ success: true });
}
