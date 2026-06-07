import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { cefr = "B1", mode = "chat" } = await request.json();
  const subjectId = 1;

  // 收集已学词汇
  const studiedNodes = await prisma.userProgress.findMany({
    where: { subjectId, userId },
    take: 30,
    include: { node: { select: { title: true, cefrLevel: true } } },
  });

  const vocabList = studiedNodes.map((n) => n.node.title).join(", ");

  const prompt = `根据以下已学词汇生成一篇英语短文（200-300词）和3道理解题。\n\n已学词汇：${vocabList || "无数据"}\nCEFR等级：${cefr}\n\n输出JSON：\n{"title":"标题","content":"短文内容","vocabulary":[{"word":"词","definition":"释义"}],"questions":[{"stem":"题干","options":["A","B","C","D"],"correct":"A","explanation":"解析"}]}\n返回纯JSON，不用markdown。`;

  try {
    const result = await callAI("deepseek", mode as any, "你是专业的英语阅读材料编写老师。", prompt);
    const clean = result.replace(/```json|```/g, "").trim();
    const data = JSON.parse(clean);
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: `生成失败: ${e.message}` }, { status: 500 });
  }
}
