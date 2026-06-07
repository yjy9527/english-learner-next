import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const subjectId = 1;

  // 今日待复习
  const dueCount = await prisma.reviewSchedule.count({
    where: { subjectId, userId, nextReviewAt: { lte: new Date() } },
  });

  // 最近学过的知识点（按 last_studied_at 排序）
  const recentStudied = await prisma.userProgress.findMany({
    where: { subjectId, userId, status: { in: ["learning", "reviewing"] } },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { node: { select: { title: true, nodeType: true } } },
  });

  // 已掌握/学习中统计
  const [masteredCount, learningCount] = await Promise.all([
    prisma.userProgress.count({ where: { subjectId, userId, status: "mastered" } }),
    prisma.userProgress.count({
      where: { subjectId, userId, status: { in: ["learning", "reviewing"] } },
    }),
  ]);

  return NextResponse.json({
    dueCount,
    masteredCount,
    learningCount,
    recentStudied: recentStudied.map((r) => ({
      title: r.node.title,
      type: r.node.nodeType,
      status: r.status,
    })),
  });
}
