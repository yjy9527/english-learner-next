import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// 旧项目 CET-4 数据路径
const DATA_PATH = path.join(
  "E:/工作文件/english-learner/data/cet4_parsed.json"
);

interface WordEntry {
  word: string;
  def_cn: string;
  pos: string;
  cefr: string;
  topic: string;
  tags: string[];
}

async function main() {
  console.log("📥 导入 CET-4 词汇...\n");

  // 读数据
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const words: WordEntry[] = JSON.parse(raw);
  console.log(`读取到 ${words.length} 条词汇\n`);

  // 确保英语学科存在（id=1）
  const subject = await prisma.subject.findUnique({ where: { slug: "english" } });
  if (!subject) {
    console.log("❌ 英语学科不存在，请先运行 prisma db seed");
    process.exit(1);
  }

  // 创建/查找主题
  const topicMap = new Map<string, number>();
  for (const w of words) {
    const topicName = w.topic || "未分类";
    if (!topicMap.has(topicName)) {
      let topic = await prisma.topic.findFirst({
        where: { name: topicName, subjectId: subject.id },
      });
      if (!topic) {
        topic = await prisma.topic.create({
          data: { name: topicName, subjectId: subject.id },
        });
      }
      topicMap.set(topicName, topic.id);
      console.log(`📁 主题: ${topicName} (id=${topic.id})`);
    }
  }

  // 批量导入词汇
  let imported = 0;
  let skipped = 0;

  for (const w of words) {
    // 检查是否已存在
    const existing = await prisma.knowledgeNode.findFirst({
      where: { title: w.word, nodeType: "vocabulary", subjectId: subject.id },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // 创建知识节点
    const node = await prisma.knowledgeNode.create({
      data: {
        subjectId: subject.id,
        nodeType: "vocabulary",
        title: w.word,
        cefrLevel: w.cefr || "B1",
        difficulty: 3,
        tags: w.tags || [],
        source: "system",
        detail: {
          definition_cn: w.def_cn,
          part_of_speech: w.pos,
          example: "",
          example_cn: "",
        },
      },
    });

    // 关联主题
    const topicName = w.topic || "未分类";
    const topicId = topicMap.get(topicName)!;
    await prisma.knowledgeTopicLink.create({
      data: { nodeId: node.id, topicId },
    });

    imported++;
    if (imported % 20 === 0) {
      console.log(`  已导入 ${imported}/${words.length}...`);
    }
  }

  console.log(`\n✅ 导入完成: ${imported} 条新增, ${skipped} 条已存在跳过`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
