"use client";

import { useEffect, useState } from "react";
import { DonutChart, BarChartWidget } from "@/components/ChartWidget";
import Link from "next/link";

interface Stats {
  totalNodes: number;
  byType: { type: string; count: number }[];
  byCefr: { level: string; count: number }[];
  progress: {
    total: number; mastered: number; learning: number;
    reviewing: number; notStarted: number; masteryRate: number;
  };
  todayDue: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="p-4 md:p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 仪表盘</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="skeleton h-4 w-16 mb-1" />
              <div className="skeleton h-7 w-12" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    vocabulary: "词汇", grammar: "语法", reading: "阅读", writing: "写作",
  };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 仪表盘</h2>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500">知识点总数</div>
          <div className="text-2xl font-bold text-primary">{stats.totalNodes}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500">掌握率</div>
          <div className="text-2xl font-bold text-green-600">{stats.progress.masteryRate}%</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500">今日待复习</div>
          <div className="text-2xl font-bold text-orange-500">{stats.todayDue}</div>
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="text-xs text-gray-500">学习中</div>
          <div className="text-2xl font-bold text-blue-500">{stats.progress.learning + stats.progress.reviewing}</div>
        </div>
      </div>

      {/* SRS 快捷入口 */}
      {stats.todayDue > 0 && (
        <Link
          href="/review"
          className="block mb-6 bg-gradient-to-r from-primary to-indigo-400 rounded-lg p-4 text-white hover:opacity-95 transition"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">🔄 SRS 间隔复习</h3>
              <p className="text-sm opacity-85 mt-1">今日有 {stats.todayDue} 个知识点待复习</p>
            </div>
            <span className="bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">开始复习 →</span>
          </div>
        </Link>
      )}

      {/* 图表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <DonutChart
            title="知识点类型分布"
            data={stats.byType.map((t) => ({
              name: typeLabels[t.type] || t.type,
              value: t.count,
            }))}
          />
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <BarChartWidget
            title="CEFR 等级分布"
            data={stats.byCefr.map((c) => ({
              name: c.level,
              count: c.count,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
