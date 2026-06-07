"use client";

import { useState } from "react";
import useSWR from "swr";
import FlashCard from "@/components/FlashCard";
import { swrConfig, fetcher } from "@/lib/swr-config";

type InnerTab = "flashcard" | "grammar" | "list";

/** 学习 Tab——闪卡 / 语法 / 词汇列表 */
export default function StudyTab() {
  const [subTab, setSubTab] = useState<InnerTab>("flashcard");

  const { data: vocab } = useSWR("/api/knowledge?type=vocabulary&pageSize=100", fetcher, swrConfig);
  const { data: allList } = useSWR("/api/knowledge?pageSize=100", fetcher, swrConfig);

  const tabs = [
    { key: "flashcard" as InnerTab, label: "单词闪卡", icon: "🃏" },
    { key: "grammar" as InnerTab, label: "语法学习", icon: "📐" },
    { key: "list" as InnerTab, label: "词汇列表", icon: "📋" },
  ];

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📖 学习</h2>

      {/* 子 Tab 切换 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSubTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              subTab === tab.key ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 闪卡 */}
      {subTab === "flashcard" && (
        <div className="max-w-lg mx-auto">
          {vocab?.data?.length > 0 ? (
            <FlashCard
              cards={vocab.data.map((n: any) => ({
                id: n.id,
                title: n.title,
                detail: { definition_cn: "", part_of_speech: "" },
                cefr: n.cefr,
                tags: n.tags || [],
              }))}
            />
          ) : (
            <div className="text-center py-12 text-gray-400">暂无词汇数据</div>
          )}
        </div>
      )}

      {/* 语法 */}
      {subTab === "grammar" && (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-4xl mb-2">📐</p>
          <p className="text-gray-500">语法学习模块开发中</p>
        </div>
      )}

      {/* 词汇列表 */}
      {subTab === "list" && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">单词</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">等级</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">主题</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {(allList?.data || []).map((node: any) => (
                  <tr key={node.id} className="border-t border-gray-100 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">{node.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{node.cefr}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{node.topics?.join(", ")}</td>
                    <td className="px-4 py-3">
                      {node.progress ? (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          node.progress.status === "mastered" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        }`}>
                          {node.progress.status === "mastered" ? "✅ 已掌握" : "📖 学习中"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">未开始</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
