import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const subjectId = 1;
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const [totalScheduled, dueCount, reviewedToday, totalReviews] = await Promise.all([
    prisma.reviewSchedule.count({ where: { subjectId, userId } }),
    prisma.reviewSchedule.count({
      where: { subjectId, userId, nextReviewAt: { lte: today } },
    }),
    prisma.reviewSchedule.count({
      where: {
        subjectId, userId,
        updatedAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
      },
    }),
    prisma.reviewSchedule.aggregate({
      where: { subjectId, userId },
      _sum: { totalReviews: true, totalCorrect: true },
    }),
  ]);

  return NextResponse.json({
    totalScheduled,
    dueCount,
    reviewedToday,
    totalReviews: totalReviews._sum.totalReviews || 0,
    totalCorrect: totalReviews._sum.totalCorrect || 0,
  });
}
