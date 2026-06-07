"use client";

import { useState } from "react";
import useSWR from "swr";
import ReviewCard from "@/components/ReviewCard";
import { swrConfig, fetcher } from "@/lib/swr-config";

export default function ReviewPage() {
  const [index, setIndex] = useState(0);
  const { data: dueData, mutate: refreshDue } = useSWR("/api/review/due", fetcher, swrConfig);
  const { data: stats } = useSWR("/api/review/stats", fetcher, swrConfig);

  const cards = dueData?.cards || [];
  const loading = !dueData;

  function handleDone() {
    refreshDue();
    if (index < cards.length - 1) setIndex((i) => i + 1);
  }

  async function startSession() {
    const res = await fetch("/api/knowledge?type=vocabulary&pageSize=10");
    const d = await res.json();
    for (const node of d.data) {
      try {
        await fetch("/api/review/grade", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeId: node.id, rating: 3 }),
        });
      } catch {}
    }
    refreshDue();
    setIndex(0);
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 animate-pulse">
        <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 SRS 复习</h2>
        <div className="flex gap-4 mb-6">{[1,2,3].map(i => <div key={i} className="skeleton h-10 w-24 rounded-lg" />)}</div>
        <div className="skeleton h-64 max-w-sm mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">🔄 SRS 间隔复习</h2>

      {stats && (
        <div className="flex gap-4 mb-6 text-sm">
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">待复习</span> <span className="font-bold text-orange-500">{stats.dueCount}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">已安排</span> <span className="font-bold text-primary">{stats.totalScheduled}</span>
          </div>
          <div className="bg-white rounded-lg px-4 py-2 shadow-sm border">
            <span className="text-gray-500">今日已复习</span> <span className="font-bold text-green-600">{stats.reviewedToday}</span>
          </div>
        </div>
      )}

      {cards.length > 0 && index < cards.length ? (
        <div className="max-w-lg mx-auto">
          <div className="text-sm text-gray-500 text-center mb-4">{index + 1} / {cards.length}</div>
          <ReviewCard card={cards[index]} onDone={handleDone} />
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-gray-500 mb-6">当前没有待复习的内容</p>
          <button onClick={startSession}
            className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition cursor-pointer">
            🚀 开始新复习（从词汇库取 10 个）
          </button>
        </div>
      )}
    </div>
  );
}
