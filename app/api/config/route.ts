import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// 获取用户配置
export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  const config = (user.userConfig as any) || {};
  return NextResponse.json({
    provider: config.provider || "deepseek",
    aiMode: config.aiMode || "chat",
    tolerance: config.tolerance ?? 1,
    theme: config.theme || "light",
    customBaseUrl: config.customBaseUrl || "",
    customApiKey: config.customApiKey || "",
    customModel: config.customModel || "",
  });
}

// 更新用户配置
export async function PUT(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  const current = (user.userConfig as any) || {};
  const updated = { ...current, ...body };

  await prisma.user.update({
    where: { id: userId },
    data: { userConfig: updated },
  });

  return NextResponse.json({ ok: true, config: updated });
}
