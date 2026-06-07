import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateSRS } from "@/lib/srs";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { nodeId, rating } = await request.json();

  if (!nodeId || ![0, 3, 4, 5].includes(rating)) {
    return NextResponse.json({ error: "参数错误" }, { status: 400 });
  }

  const subjectId = 1;

  // 查找或创建 SRS 记录
  let schedule = await prisma.reviewSchedule.findUnique({
    where: { subjectId_nodeId_userId: { subjectId, nodeId, userId } },
  });

  const currentState = schedule
    ? { easeFactor: schedule.easeFactor, intervalDays: schedule.intervalDays, repetitions: schedule.repetitions }
    : { easeFactor: 2.5, intervalDays: 0, repetitions: 0 };

  const result = calculateSRS(currentState, rating);

  // 更新或创建 SRS 记录
  if (schedule) {
    schedule = await prisma.reviewSchedule.update({
      where: { id: schedule.id },
      data: {
        easeFactor: result.easeFactor,
        intervalDays: result.intervalDays,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        totalReviews: { increment: 1 },
        totalCorrect: rating >= 4 ? { increment: 1 } : undefined,
        lastRating: rating,
      },
    });
  } else {
    schedule = await prisma.reviewSchedule.create({
      data: {
        subjectId,
        nodeId,
        userId,
        easeFactor: result.easeFactor,
        intervalDays: result.intervalDays,
        repetitions: result.repetitions,
        nextReviewAt: result.nextReviewAt,
        totalReviews: 1,
        totalCorrect: rating >= 4 ? 1 : 0,
        lastRating: rating,
      },
    });
  }

  // 同步更新 user_progress
  const existingProgress = await prisma.userProgress.findUnique({
    where: { subjectId_nodeId_userId: { subjectId, nodeId, userId } },
  });

  if (existingProgress) {
    await prisma.userProgress.update({
      where: { id: existingProgress.id },
      data: {
        timesStudied: { increment: 1 },
        timesCorrect: rating >= 4 ? { increment: 1 } : undefined,
        timesWrong: rating < 4 ? { increment: 1 } : undefined,
        lastStudiedAt: new Date(),
        status: rating >= 4
          ? existingProgress.timesCorrect >= 2 ? "mastered" : "reviewing"
          : "learning",
        masteryScore: rating >= 4
          ? Math.min(100, existingProgress.masteryScore + 10)
          : Math.max(0, existingProgress.masteryScore - 5),
      },
    });
  } else {
    await prisma.userProgress.create({
      data: {
        subjectId,
        nodeId,
        userId,
        status: "learning",
        masteryScore: rating >= 4 ? 30 : 10,
        timesStudied: 1,
        timesCorrect: rating >= 4 ? 1 : 0,
        timesWrong: rating < 4 ? 1 : 0,
        lastStudiedAt: new Date(),
        firstStudiedAt: new Date(),
      },
    });
  }

  return NextResponse.json({
    ok: true,
    nextReviewAt: result.nextReviewAt.toISOString().slice(0, 10),
    intervalDays: result.intervalDays,
    easeFactor: result.easeFactor,
  });
}
