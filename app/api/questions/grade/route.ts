import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callAI } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { questionId, userAnswer } = await request.json();
  if (!questionId || !userAnswer) {
    return NextResponse.json({ error: "参数不全" }, { status: 400 });
  }

  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) {
    return NextResponse.json({ error: "题目不存在" }, { status: 404 });
  }

  const content = question.content as any;
  const correct = content.correct || content.correct_answer || "";

  // 简单判断对错（精确匹配或包含）
  const isCorrect = userAnswer.trim().toLowerCase() === correct.toLowerCase()
    || userAnswer.trim().toLowerCase().includes(correct.toLowerCase());

  let explanation = content.explanation || "";
  let errorType = "";

  // 如果答错，调 AI 批改
  if (!isCorrect) {
    try {
      const aiResult = await callAI(
        "deepseek", "chat",
        "你是英语批改老师，分析学生的错误并给出简短解析。",
        `题目：${content.stem}\n正确答案：${correct}\n学生答案：${userAnswer}\n\n简分析错误类型和正确用法，50字以内。`
      );
      explanation = aiResult;
      errorType = "AI分析";
    } catch {
      explanation = explanation || `正确答案是: ${correct}`;
      errorType = "未分类";
    }
  }

  // 保存答题记录
  await prisma.answerRecord.create({
    data: {
      subjectId: question.subjectId,
      questionId,
      nodeId: question.nodeId,
      userId,
      userAnswer,
      isCorrect: isCorrect ? 1 : 0,
      score: isCorrect ? 100 : 0,
      gradingResult: { errorType, explanation, isCorrect },
    },
  });

  // 更新题目使用次数
  await prisma.question.update({
    where: { id: questionId },
    data: { usageCount: { increment: 1 } },
  });

  return NextResponse.json({
    isCorrect,
    correctAnswer: correct,
    explanation,
  });
}
