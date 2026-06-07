# 英语学习助手 · Next.js 全栈重构 · 项目指南

## 语言设定
- 全程用中文回复我，包括代码注释也用中文（除非第三方库本身是全英文的）
- 技术文档、API说明给我中文解释
- 报错信息贴出来时保留英文原文，但用中文分析原因和解决方案

## 开发原则

### 必须遵守
1. **先出可用的最小版本**。不要一开始就设计完美架构
2. **每一步都要可验证**。每实现一个功能点，告诉我怎么测
3. **控制复杂度**。一个文件不超过 300 行，一个函数不超过 30 行
4. **优先用最成熟的技术栈**

### 绝对禁止
1. 不要一次性改十几个文件——每一步只改 1-3 个文件
2. 不要写"示例性质"的伪代码——所有代码直接能跑

## 当前项目

- **项目名称**：英语学习助手（english-learner-next）
- **技术栈**：Next.js 15 + TypeScript + Tailwind CSS + Prisma + Neon Postgres
- **设计文档**：docs/superpowers/specs/2026-06-07-english-learner-redesign.md
- **实施计划**：docs/superpowers/plans/2026-06-07-english-learner-redesign.md
- **旧项目**：E:\工作文件\english-learner（FastAPI + SQLite，数据来源）

## Git 备份规则 ⚠️

**完成每个小阶段（Task）后立即 git commit 备份。**

- 每个 Task 结束后至少一次 commit，如果 Task 内步骤多可以中途多次 commit
- Commit message 格式：`feat: Task X — 简短描述`
- 每次 commit 前告诉我 diff 大概改了啥，一句话总结

## Next.js 版本注意事项

本项目使用 Next.js 16+，部分 API 可能与常见教程不同。遇到不熟悉的 API 时，**优先查看 `node_modules/next/dist/docs/` 中的文档**，或使用 Next.js 官方文档（nextjs.org/docs）核实。
