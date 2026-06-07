import { prisma } from "@/lib/prisma";

/** 根据知识点总量，动态决定防重复参考题数 */
export function getReferenceCount(nodeTotal: number): number {
  if (nodeTotal < 20) return 3;
  if (nodeTotal <= 100) return 5;
  if (nodeTotal <= 500) return 10;
  return 15; // > 500 封顶
}

/** 获取该知识点最近N题的题干（防重复用） */
export async function getRecentQuestions(nodeId: number, count: number): Promise<string[]> {
  const questions = await prisma.question.findMany({
    where: { nodeId, status: "active" },
    orderBy: { createdAt: "desc" },
    take: count,
    select: { content: true },
  });
  return questions.map((q) => (q.content as any)?.stem || "").filter(Boolean);
}

/** 获取 SM-2 到期的错题（按用户和知识点） */
export async function getDueWrongQuestions(
  userId: number,
  nodeIds: number[],
  tolerance: number // ±0（严格）/ ±1（标准）/ ±3（强化）
): Promise<number[]> {
  const subjectId = 1;
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + tolerance);
  maxDate.setHours(23, 59, 59, 999);

  // 查询这些知识点中 SM-2 已到期的 node
  const dueSchedules = await prisma.reviewSchedule.findMany({
    where: {
      subjectId,
      userId,
      nodeId: { in: nodeIds },
      nextReviewAt: { lte: maxDate },
    },
    select: { nodeId: true },
  });

  return dueSchedules.map((s) => s.nodeId);
}
