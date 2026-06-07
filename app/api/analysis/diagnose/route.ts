import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const subjectId = 1;

  // 收集完整数据包
  const [
    progressSummary, weakNodes, recentErrors, errorStats,
  ] = await Promise.all([
    prisma.userProgress.groupBy({
      by: ["status"], where: { subjectId, userId }, _count: true,
    }),
    prisma.userProgress.findMany({
      where: { subjectId, userId, masteryScore: { lt: 50 } },
      orderBy: { masteryScore: "asc" },
      take: 10,
      include: { node: { select: { title: true, nodeType: true, cefrLevel: true } } },
    }),
    prisma.answerRecord.findMany({
      where: { subjectId, userId, isCorrect: 0 },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { question: { select: { content: true } }, node: { select: { title: true } } },
    }),
    prisma.answerRecord.groupBy({
      by: ["isCorrect"], where: { subjectId, userId }, _count: true,
    }),
  ]);

  const totalAnswers = errorStats.reduce((s, e) => s + e._count, 0);
  const correctAnswers = errorStats.find((e) => e.isCorrect === 1)?._count || 0;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const statusCount: Record<string, number> = {};
  for (const s of progressSummary) statusCount[s.status] = s._count;

  // 构建 AI 诊断请求
  const dataPackage = {
    learner_profile: {
      total_studied: statusCount["learning"] + statusCount["reviewing"] + statusCount["mastered"] || 0,
      mastered: statusCount["mastered"] || 0,
      accuracy,
      total_answers: totalAnswers,
    },
    weakest_nodes: weakNodes.map((w) => ({
      title: w.node.title,
      type: w.node.nodeType,
      mastery_score: w.masteryScore,
    })),
    recent_errors: recentErrors.map((e) => ({
      question: (e.question?.content as any)?.stem || "",
      knowledge_point: e.node?.title || "",
    })),
  };

  const prompt = `分析以下英语学习数据，给出诊断和建议。\n\n${JSON.stringify(dataPackage, null, 2)}\n\n请用中文回答：\n1. 总体评价（1-2句）\n2. 主要薄弱环节分析\n3. 针对性学习建议（3条具体建议）`;

  try {
    const result = await callAI("deepseek", "chat", "你是专业的英语学习诊断老师。", prompt);
    return NextResponse.json({ diagnosis: result, data: dataPackage });
  } catch (e: any) {
    return NextResponse.json({ error: `诊断失败: ${e.message}` }, { status: 500 });
  }
}
