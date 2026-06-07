"use client";

import { useState } from "react";
import useSWR from "swr";
import { DonutChart, BarChartWidget } from "@/components/ChartWidget";
import { swrConfig, fetcher } from "@/lib/swr-config";

export default function AnalysisPage() {
  const { data } = useSWR("/api/analysis/overview", fetcher, swrConfig);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  async function runDiagnosis() {
    setDiagLoading(true);
    try {
      const res = await fetch("/api/analysis/diagnose", { method: "POST" });
      const d = await res.json();
      setDiagnosis(d.diagnosis);
    } catch {}
    setDiagLoading(false);
  }

  if (!data) {
    return (
      <div className="p-4 md:p-6 animate-pulse">
        <h2 className="text-xl font-bold mb-4">📈 学习分析</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="skeleton h-20 rounded-lg" />)}
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = { vocabulary: "词汇", grammar: "语法", reading: "阅读", writing: "写作" };

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📈 学习分析</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "知识点总数", value: data.totalNodes, color: "text-primary" },
          { label: "已掌握", value: data.progress.mastered, color: "text-green-600" },
          { label: "正确率", value: `${data.answers.accuracy}%`, color: "text-blue-600" },
          { label: "总练习", value: data.answers.total, color: "text-orange-500" },
        ].map((c, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border transition hover:shadow-md">
            <div className="text-xs text-gray-500">{c.label}</div>
            <div className={`text-2xl font-bold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <DonutChart title="知识点类型" data={data.byType.map((t: any) => ({ name: typeLabels[t.name] || t.name, value: t.count }))} />
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <BarChartWidget title="CEFR 分布" data={data.byCefr} />
        </div>
      </div>

      {data.weakNodes?.length > 0 && (
        <div className="bg-white rounded-lg p-4 shadow-sm border mb-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">🎯 薄弱知识点</h3>
          {data.weakNodes.map((w: any, i: number) => (
            <div key={i} className="flex items-center justify-between text-sm py-1">
              <span>{w.title} <span className="text-gray-400">({w.cefr})</span></span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full transition-all duration-500" style={{ width: `${w.masteryScore}%` }} />
                </div>
                <span className="text-xs text-gray-500">{w.masteryScore}%</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm text-gray-700">🤖 AI 智能诊断</h3>
          <button onClick={runDiagnosis} disabled={diagLoading}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer">
            {diagLoading ? "分析中..." : "🔄 开始分析"}
          </button>
        </div>
        {diagnosis ? (
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed bg-gray-50 p-4 rounded-lg">{diagnosis}</div>
        ) : (
          <p className="text-sm text-gray-400">点击按钮，AI 将分析你的学习数据并给出个性化建议</p>
        )}
      </div>
    </div>
  );
}
