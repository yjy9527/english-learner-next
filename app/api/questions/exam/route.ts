import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI, AIMode } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { count = 15, mode = "chat" } = await request.json();
  const subjectId = 1;

  // 收集薄弱点数据发给 AI
  const weakNodes = await prisma.userProgress.findMany({
    where: { subjectId, userId, masteryScore: { lt: 50 } },
    orderBy: { masteryScore: "asc" },
    take: 10,
    include: { node: { select: { title: true, cefrLevel: true, detail: true } } },
  });

  const errorStats = await prisma.answerRecord.groupBy({
    by: ["isCorrect"],
    where: { subjectId, userId },
    _count: true,
  });
  const totalAnswers = errorStats.reduce((s, e) => s + e._count, 0);
  const correctAnswers = errorStats.find((e) => e.isCorrect === 1)?._count || 0;
  const accuracy = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;

  const weakList = weakNodes
    .map((n) => `- ${n.node.title} (${n.node.cefrLevel}): ${(n.node.detail as any)?.definition_cn || ""}, 掌握度: ${n.masteryScore}%`)
    .join("\n");

  const prompt = `根据学生的学习数据分析，生成 ${count} 道英语测试题。\n\n学生薄弱知识点：\n${weakList || "无数据"}\n答题正确率：${accuracy}%\n\n要求：\n- 覆盖薄弱知识点\n- 难度从易到难递进\n- 题型混合（选择 60% + 填空 40%）\n- 每题输出 JSON：{"type":"multiple_choice|fill_blank","stem":"题干","options":["A","B","C","D"],"correct":"答案","explanation":"解析","difficulty":1-5}\n- 返回纯 JSON 数组，不用 markdown`;

  try {
    const aiResult = await callAI("deepseek", mode as AIMode, "你是专业的英语试卷命题老师。", prompt);
    const clean = aiResult.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(clean);

    // 存入题库
    const saved = [];
    for (const q of questions) {
      const node = weakNodes[Math.floor(Math.random() * Math.min(weakNodes.length, 3))];
      const savedQ = await prisma.question.create({
        data: {
          subjectId,
          nodeId: node?.nodeId || null,
          questionType: q.type || "multiple_choice",
          difficulty: q.difficulty || 3,
          cefrLevel: node?.node.cefrLevel || "B1",
          content: q,
          source: "ai_generated",
        },
      });
      saved.push({ ...q, id: savedQ.id });
    }

    return NextResponse.json({
      questions: saved,
      meta: { total: saved.length, accuracy, mode },
    });
  } catch (e: any) {
    console.error("出卷失败:", e);
    return NextResponse.json({ error: `出卷失败: ${e.message}` }, { status: 500 });
  }
}
