"use client";

import { useEffect, useState } from "react";
import FlashCard from "@/components/FlashCard";

type Tab = "flashcard" | "grammar" | "list";

interface ListNode {
  id: number;
  type: string;
  title: string;
  cefr: string;
  topics: string[];
  progress: { status: string; masteryScore: number } | null;
}

export default function StudyPage() {
  const [activeTab, setActiveTab] = useState<Tab>("flashcard");
  const [cards, setCards] = useState<any[]>([]);
  const [list, setList] = useState<ListNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 加载词汇数据（闪卡用）
    fetch("/api/knowledge?type=vocabulary&pageSize=100")
      .then((r) => r.json())
      .then((d) => {
        setCards(
          d.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            detail: { definition_cn: "", part_of_speech: "" },
            cefr: n.cefr,
            tags: n.tags || [],
          }))
        );
      })
      .catch(console.error);

    // 加载完整列表（含详情）
    fetch("/api/knowledge?pageSize=100")
      .then((r) => r.json())
      .then((d) => setList(d.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "flashcard", label: "单词闪卡", icon: "🃏" },
    { key: "grammar", label: "语法学习", icon: "📐" },
    { key: "list", label: "词汇列表", icon: "📋" },
  ];

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex gap-2 mb-4">
          {tabs.map((t) => (
            <div key={t.key} className="skeleton h-10 w-28 rounded-lg" />
          ))}
        </div>
        <div className="skeleton h-64 max-w-sm mx-auto rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📖 学习</h2>

      {/* Tab 切换 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
              activeTab === tab.key
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* 闪卡 */}
      {activeTab === "flashcard" && (
        <div className="max-w-lg mx-auto">
          {cards.length > 0 ? (
            <FlashCard cards={cards} />
          ) : (
            <div className="text-center py-12 text-gray-400">暂无疑问数据</div>
          )}
        </div>
      )}

      {/* 语法占位 */}
      {activeTab === "grammar" && (
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-4xl mb-2">📐</p>
          <p className="text-gray-500">语法学习模块开发中</p>
          <p className="text-sm text-gray-400 mt-1">之后可从知识库导入语法知识点</p>
        </div>
      )}

      {/* 词汇列表 */}
      {activeTab === "list" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
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
                {list.map((node) => (
                  <tr key={node.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{node.title}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{node.cefr}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {node.topics?.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {node.progress ? (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          node.progress.status === "mastered"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
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
          {list.length === 0 && (
            <div className="text-center py-8 text-gray-400">暂无数据</div>
          )}
        </div>
      )}
    </div>
  );
}
