import { NextRequest, NextResponse } from "next/server";
import { signToken, setAuthCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "请输入密码" }, { status: 400 });
    }

    const userId = await verifyPassword(password);
    if (!userId) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const token = await signToken(userId);
    await setAuthCookie(token);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("登录失败:", e);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
