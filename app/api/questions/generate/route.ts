import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI, AIMode } from "@/lib/ai";
import { getReferenceCount, getRecentQuestions, getDueWrongQuestions } from "@/lib/question-strategy";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const body = await request.json();
  const {
    nodeIds = [],        // 知识点 ID 列表
    count = 5,           // 出题数量
    mode = "chat",       // chat | think
    tolerance = 1,       // SM-2 宽容度: 0/1/3
    questionTypes = ["multiple_choice", "fill_blank"], // 题型
  } = body;

  if (!nodeIds.length) {
    return NextResponse.json({ error: "请选择题知识点范围" }, { status: 400 });
  }

  const subjectId = 1;

  // 1. 获取知识点信息
  const nodes = await prisma.knowledgeNode.findMany({
    where: { id: { in: nodeIds }, subjectId, status: "active" },
    select: { id: true, title: true, cefrLevel: true, detail: true },
  });

  if (!nodes.length) {
    return NextResponse.json({ error: "未找到有效知识点" }, { status: 400 });
  }

  // 2. SM-2 到期错题混入
  const dueNodeIds = await getDueWrongQuestions(userId, nodeIds, tolerance);
  const wrongQuestions = dueNodeIds.length > 0
    ? await prisma.question.findMany({
        where: {
          nodeId: { in: dueNodeIds },
          answerRecords: { some: { userId, isCorrect: 0 } },
        },
        take: Math.floor(count * 0.5), // 最多混入 50%
        include: { node: { select: { title: true } } },
      })
    : [];

  const newQuestionCount = count - wrongQuestions.length;

  // 3. 防重复：收集已有题干
  const totalKnowledgeNodes = await prisma.knowledgeNode.count({
    where: { subjectId, status: "active" },
  });
  const refCount = getReferenceCount(totalKnowledgeNodes);

  let recentStems: string[] = [];
  for (const node of nodes) {
    const stems = await getRecentQuestions(node.id, refCount);
    recentStems = recentStems.concat(stems);
  }

  // 4. 构建 AI prompt
  const knowledgeList = nodes
    .map((n) => `- ${n.title} (${n.cefrLevel}): ${(n.detail as any)?.definition_cn || ""}`)
    .join("\n");

  const avoidStems = recentStems.length > 0
    ? `\n\n【避免出相似题目】以下题目已经出过，请避免重复：\n${recentStems.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    : "";

  const typesDesc = questionTypes.includes("multiple_choice")
    ? "- 选择题（4 选项，含干扰项分析）"
    : "";
  const fillDesc = questionTypes.includes("fill_blank")
    ? "- 填空题（挖空关键词）"
    : "";

  const prompt = `知识点：\n${knowledgeList}\n\n请生成 ${newQuestionCount} 道英语练习题。题型要求：${typesDesc}${fillDesc}\n\n每题输出 JSON 格式：\n{"type":"multiple_choice|fill_blank","stem":"题干","options":["A","B","C","D"],"correct":"正确答案","explanation":"解析"}\n\nCEFR 等级：${nodes[0].cefrLevel}。返回纯 JSON 数组，不用 markdown 包裹。${avoidStems}`;

  // 5. 调用 AI
  try {
    const aiResult = await callAI("deepseek", mode as AIMode, "你是专业的英语出题老师。", prompt);
    // 解析 AI 返回的 JSON
    const clean = aiResult.replace(/```json|```/g, "").trim();
    const newQuestions = JSON.parse(clean);

    // 6. 存入题库 + 组装返回
    const savedQuestions = [];
    for (const q of newQuestions) {
      const saved = await prisma.question.create({
        data: {
          subjectId,
          nodeId: nodes[0].id,
          questionType: q.type || "multiple_choice",
          difficulty: 3,
          cefrLevel: nodes[0].cefrLevel,
          content: q,
          source: "ai_generated",
        },
      });
      savedQuestions.push({ ...q, id: saved.id, source: "new" });
    }

    // 混入错题
    const mixedWrong = wrongQuestions.map((q) => ({
      ...(q.content as any),
      id: q.id,
      source: "review",
      nodeTitle: (q as any).node?.title,
    }));

    return NextResponse.json({
      questions: [...mixedWrong, ...savedQuestions],
      meta: {
        total: count,
        newCount: savedQuestions.length,
        wrongCount: mixedWrong.length,
        mode,
      },
    });
  } catch (e: any) {
    console.error("出题失败:", e);
    return NextResponse.json({ error: `出题失败: ${e.message}` }, { status: 500 });
  }
}
