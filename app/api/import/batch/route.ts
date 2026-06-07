import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const userId = await getCurrentUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { items } = await request.json();
  if (!Array.isArray(items) || !items.length) {
    return NextResponse.json({ error: "请提供要导入的数据数组" }, { status: 400 });
  }

  const subjectId = 1;
  let imported = 0;
  let skipped = 0;

  for (const item of items) {
    if (!item.title) continue;

    const existing = await prisma.knowledgeNode.findFirst({
      where: { title: item.title, nodeType: item.type || "vocabulary", subjectId },
    });
    if (existing) { skipped++; continue; }

    // 处理主题
    let topicId: number | undefined;
    if (item.topic) {
      let topic = await prisma.topic.findFirst({
        where: { name: item.topic, subjectId },
      });
      if (!topic) {
        topic = await prisma.topic.create({
          data: { name: item.topic, subjectId },
        });
      }
      topicId = topic.id;
    }

    const node = await prisma.knowledgeNode.create({
      data: {
        subjectId,
        nodeType: item.type || "vocabulary",
        title: item.title,
        cefrLevel: item.cefr || "B1",
        difficulty: item.difficulty || 3,
        tags: item.tags || [],
        source: "user_import",
        detail: {
          definition_cn: item.definition || "",
          part_of_speech: item.pos || "",
          example: item.example || "",
          example_cn: item.exampleCn || "",
        },
      },
    });

    if (topicId) {
      await prisma.knowledgeTopicLink.create({
        data: { nodeId: node.id, topicId },
      });
    }

    imported++;
  }

  return NextResponse.json({ imported, skipped });
}
