import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("🌱 开始初始化数据...\n");

  // 1. 创建英语学科
  const existingSubject = await prisma.subject.findUnique({
    where: { slug: "english" },
  });
  if (!existingSubject) {
    await prisma.subject.create({
      data: {
        name: "英语",
        slug: "english",
        description: "英语学习，涵盖词汇、语法、阅读、写作四个维度，基于 CEFR 等级体系",
      },
    });
    console.log("✅ 英语学科已创建");
  } else {
    console.log("⏭️  英语学科已存在，跳过");
  }

  // 2. 创建默认管理员
  const existingUser = await prisma.user.findUnique({
    where: { username: "admin" },
  });
  if (!existingUser) {
    const password = process.env.AUTH_PASSWORD || "admin123";
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        username: "admin",
        passwordHash,
      },
    });
    console.log("✅ 管理员账号已创建 (admin)");
  } else {
    console.log("⏭️  管理员账号已存在，跳过");
  }

  console.log("\n🎉 初始化完成。");
}

main()
  .catch((e) => {
    console.error("❌ 初始化失败:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
