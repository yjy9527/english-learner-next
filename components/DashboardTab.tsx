"use client";

import useSWR from "swr";
import { DonutChart, BarChartWidget } from "@/components/ChartWidget";
import { swrConfig, fetcher } from "@/lib/swr-config";
import { useTabSwitch } from "@/lib/tab-context";

/** 仪表盘 Tab——学习概览统计 + 快捷入口 */
export default function DashboardTab() {
  const { data: stats } = useSWR("/api/dashboard/stats", fetcher, swrConfig);
  const { switchTab } = useTabSwitch();

  if (!stats) {
    return (
      <div className="p-4 md:p-6 animate-pulse">
        <h2 className="text-xl font-bold text-gray-800 mb-4">📊 仪表盘</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm border">
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

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "知识点总数", value: stats.totalNodes, color: "text-primary" },
          { label: "掌握率", value: `${stats.progress.masteryRate}%`, color: "text-green-600" },
          { label: "今日待复习", value: stats.todayDue, color: "text-orange-500" },
          { label: "学习中", value: stats.progress.learning + stats.progress.reviewing, color: "text-blue-500" },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition hover:shadow-md">
            <div className="text-xs text-gray-500">{card.label}</div>
            <div className={`text-2xl font-bold ${card.color} transition-all duration-300`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* SRS 复习快捷入口 */}
      {stats.todayDue > 0 && (
        <button
          onClick={() => switchTab("review")}
          className="w-full mb-6 bg-gradient-to-r from-primary to-indigo-400 rounded-lg p-4 text-white hover:opacity-95 transition cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">🔄 SRS 间隔复习</h3>
              <p className="text-sm opacity-85 mt-1">今日有 {stats.todayDue} 个知识点待复习</p>
            </div>
            <span className="bg-white/20 px-4 py-2 rounded-lg font-bold text-sm">去复习 →</span>
          </div>
        </button>
      )}

      {/* 快捷操作 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { tab: "study" as const, icon: "📖", label: "单词闪卡" },
          { tab: "practice" as const, icon: "✏️", label: "AI 出题练习" },
          { tab: "reading" as const, icon: "📄", label: "AI 阅读" },
          { tab: "knowledge" as const, icon: "📥", label: "知识库" },
        ].map((item) => (
          <button
            key={item.tab}
            onClick={() => switchTab(item.tab)}
            className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition cursor-pointer text-center"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-xs text-gray-600">{item.label}</div>
          </button>
        ))}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition">
          <DonutChart
            title="知识点类型分布"
            data={stats.byType.map((t: any) => ({ name: typeLabels[t.type] || t.type, value: t.count }))}
          />
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border hover:shadow-md transition">
          <BarChartWidget
            title="CEFR 等级分布"
            data={stats.byCefr.map((c: any) => ({ name: c.level, count: c.count }))}
          />
        </div>
      </div>
    </div>
  );
}
