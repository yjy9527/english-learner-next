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

  // 今天到期的复习卡片
  const due = await prisma.reviewSchedule.findMany({
    where: { subjectId, userId, nextReviewAt: { lte: today } },
    include: {
      node: {
        select: { id: true, title: true, nodeType: true, cefrLevel: true, detail: true },
      },
    },
    orderBy: { nextReviewAt: "asc" },
    take: 50,
  });

  return NextResponse.json({
    total: due.length,
    cards: due.map((d) => ({
      scheduleId: d.id,
      nodeId: d.node.id,
      title: d.node.title,
      type: d.node.nodeType,
      cefr: d.node.cefrLevel,
      detail: d.node.detail,
      easeFactor: d.easeFactor,
      intervalDays: d.intervalDays,
      repetitions: d.repetitions,
    })),
  });
}
