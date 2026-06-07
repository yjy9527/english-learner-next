import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json({ error: "未登录" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type") || undefined;
  const cefr = searchParams.get("cefr") || undefined;
  const search = searchParams.get("search") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 100);

  const subjectId = 1;
  const where: any = { subjectId, status: "active" };

  if (type) where.nodeType = type;
  if (cefr) where.cefrLevel = cefr;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { detail: { path: ["definition_cn"], string_contains: search } },
    ];
  }

  const [nodes, total] = await Promise.all([
    prisma.knowledgeNode.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { id: "asc" },
      include: {
        topicLinks: { include: { topic: { select: { name: true } } } },
        userProgresses: {
          where: { userId },
          select: { status: true, masteryScore: true },
        },
      },
    }),
    prisma.knowledgeNode.count({ where }),
  ]);

  return NextResponse.json({
    data: nodes.map((n) => ({
      id: n.id,
      type: n.nodeType,
      title: n.title,
      cefr: n.cefrLevel,
      tags: n.tags,
      topics: n.topicLinks.map((l) => l.topic.name),
      progress: n.userProgresses[0] || null,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
