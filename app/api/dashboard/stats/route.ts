import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const subjectId = 1; // 英语

  // 并行查询
  const [totalNodes, byType, byCefr, progressSummary, todayDue] = await Promise.all([
    // 知识点总数
    prisma.knowledgeNode.count({
      where: { subjectId, status: "active" },
    }),

    // 按类型分布
    prisma.knowledgeNode.groupBy({
      by: ["nodeType"],
      where: { subjectId, status: "active" },
      _count: true,
    }),

    // 按 CEFR 分布
    prisma.knowledgeNode.groupBy({
      by: ["cefrLevel"],
      where: { subjectId, status: "active" },
      _count: true,
    }),

    // 掌握度汇总
    prisma.userProgress.groupBy({
      by: ["status"],
      where: { subjectId, userId },
      _count: true,
    }),

    // 今日待复习数
    prisma.reviewSchedule.count({
      where: {
        subjectId,
        userId,
        nextReviewAt: { lte: new Date() },
      },
    }),
  ]);

  // 计算掌握率
  const statusCount: Record<string, number> = {};
  for (const s of progressSummary) {
    statusCount[s.status] = s._count;
  }
  const totalProgress =
    (statusCount["learning"] || 0) +
    (statusCount["reviewing"] || 0) +
    (statusCount["mastered"] || 0);
  const mastered = statusCount["mastered"] || 0;
  const masteryRate = totalProgress > 0 ? Math.round((mastered / totalProgress) * 100) : 0;

  return NextResponse.json({
    totalNodes,
    byType: byType.map((t) => ({ type: t.nodeType, count: t._count })),
    byCefr: byCefr.map((c) => ({ level: c.cefrLevel, count: c._count })),
    progress: {
      total: totalProgress,
      mastered,
      learning: statusCount["learning"] || 0,
      reviewing: statusCount["reviewing"] || 0,
      notStarted: statusCount["not_started"] || totalNodes - totalProgress,
      masteryRate,
    },
    todayDue,
  });
}
