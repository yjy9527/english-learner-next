"use client";

import { useEffect, useState } from "react";
import ReviewCard from "@/components/ReviewCard";

interface Card {
  scheduleId: number;
  nodeId: number;
  title: string;
  type: string;
  cefr: string;
  detail: any;
}

interface Stats {
  totalScheduled: number;
  dueCount: number;
  reviewedToday: number;
  totalReviews: number;
  totalCorrect: number;
}

export default function ReviewPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/review/due")
      .then((r) => r.json())
      .then((d) => setCards(d.cards))
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/review/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  function handleDone() {
    // 重新加载统计
    fetch("/api/review/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);

    if (index < cards.length - 1) {
      setIndex((i) => i + 1);
    }
  }

  function startSession() {
    // 把还没排期的知识点加入 SRS（首次学习）
    fetch("/api/knowledge?type=vocabulary&pageSize=10")
      .then((r) => r.json())
      .then(async (d) => {
        for (const node of d.data) {
          // 对每个没有排期的知识点，初始化 SRS 并评个初始分
          try {
            await fetch("/api/review/grade", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ nodeId: node.id, rating: 3 }),
            });
          } catch {}
        }
        // 重新加载到期卡片
        const res = await fetch("/api/review/due");
        const data = await res.json();
        setCards(data.cards);
        setIndex(0);
        const s = await fetch("/api/review/stats");
        setStats(await s.json());
      })
      .catch(console.error);
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 SRS 复习</h2>
        <div className="skeleton h-8 w-48 mb-4" />
        <div className="skeleton h-64 max-w-sm mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 SRS 间隔复习</h2>

      {/* 统计栏 */}
      {stats && (
        <div className="flex gap-4 mb-6 text-sm">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">待复习</span>{" "}
            <span className="font-bold text-orange-500">{stats.dueCount}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">已安排</span>{" "}
            <span className="font-bold text-primary">{stats.totalScheduled}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">今日已复习</span>{" "}
            <span className="font-bold text-green-600">{stats.reviewedToday}</span>
          </div>
        </div>
      )}

      {/* 复习卡片 */}
      {cards.length > 0 && index < cards.length ? (
        <div className="max-w-lg mx-auto">
          <div className="text-sm text-gray-500 text-center mb-4">
            {index + 1} / {cards.length}
          </div>
          <ReviewCard card={cards[index]} onDone={handleDone} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-gray-500 mb-2">当前没有待复习的内容</p>
          <p className="text-sm text-gray-400 mb-6">
            {cards.length === 0 && index >= cards.length
              ? "全部复习完成！"
              : "知识点加入 SRS 排期后会出现在这里"}
          </p>
          <button
            onClick={startSession}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition cursor-pointer"
          >
            🚀 开始新复习（从词汇库取 10 个）
          </button>
        </div>
      )}
    </div>
  );
}
