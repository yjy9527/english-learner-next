import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const subjectId = 1;

  // 并行查询所有分析数据
  const [
    totalNodes, progressSummary, byType, byCefr,
    totalAnswers, correctAnswers, weakNodes, errorByCategory,
  ] = await Promise.all([
    prisma.knowledgeNode.count({ where: { subjectId, status: "active" } }),

    prisma.userProgress.groupBy({
      by: ["status"], where: { subjectId, userId }, _count: true,
    }),

    prisma.knowledgeNode.groupBy({
      by: ["nodeType"], where: { subjectId, status: "active" }, _count: true,
    }),

    prisma.knowledgeNode.groupBy({
      by: ["cefrLevel"], where: { subjectId, status: "active" }, _count: true,
    }),

    prisma.answerRecord.count({ where: { subjectId, userId } }),

    prisma.answerRecord.count({ where: { subjectId, userId, isCorrect: 1 } }),

    prisma.userProgress.findMany({
      where: { subjectId, userId, status: { in: ["learning", "reviewing"] } },
      orderBy: { masteryScore: "asc" },
      take: 10,
      include: { node: { select: { title: true, nodeType: true, cefrLevel: true } } },
    }),

    prisma.answerRecord.groupBy({
      by: ["isCorrect"], where: { subjectId, userId }, _count: true,
    }),
  ]);

  const statusCount: Record<string, number> = {};
  for (const s of progressSummary) statusCount[s.status] = s._count;

  const accuracy = totalAnswers > 0
    ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  return NextResponse.json({
    totalNodes,
    progress: {
      mastered: statusCount["mastered"] || 0,
      learning: statusCount["learning"] || 0,
      reviewing: statusCount["reviewing"] || 0,
      notStarted: Math.max(0, totalNodes - (statusCount["mastered"] || 0) - (statusCount["learning"] || 0) - (statusCount["reviewing"] || 0)),
    },
    byType: byType.map((t) => ({ name: t.nodeType, count: t._count })),
    byCefr: byCefr.map((c) => ({ name: c.cefrLevel, count: c._count })),
    answers: { total: totalAnswers, correct: correctAnswers, accuracy },
    weakNodes: weakNodes.map((w) => ({
      title: w.node.title,
      type: w.node.nodeType,
      cefr: w.node.cefrLevel,
      masteryScore: w.masteryScore,
    })),
  });
}
