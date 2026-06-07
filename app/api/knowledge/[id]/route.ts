import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { id } = await params;
  const nodeId = parseInt(id);

  const node = await prisma.knowledgeNode.findUnique({
    where: { id: nodeId },
    include: {
      topicLinks: { include: { topic: { select: { name: true } } } },
      userProgresses: {
        where: { userId },
        select: { status: true, masteryScore: true, timesStudied: true },
      },
    },
  });

  if (!node) {
    return NextResponse.json({ error: "知识点不存在" }, { status: 404 });
  }

  return NextResponse.json({
    id: node.id,
    type: node.nodeType,
    title: node.title,
    cefr: node.cefrLevel,
    difficulty: node.difficulty,
    tags: node.tags,
    detail: node.detail,
    topics: node.topicLinks.map((l) => l.topic.name),
    progress: node.userProgresses[0] || null,
  });
}
