"use client";

import { useEffect, useState } from "react";

export default function KnowledgePage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search) params.set("search", search);
    if (typeFilter) params.set("type", typeFilter);
    fetch(`/api/knowledge?${params}`)
      .then((r) => r.json())
      .then((d) => { setData(d.data); setTotal(d.pagination?.total || 0); })
      .catch(console.error);
  }, [page, search, typeFilter]);

  async function handleImport() {
    if (!importText.trim()) return;
    // 简易格式：每行 "单词 释义" 用空格分隔
    const lines = importText.trim().split("\n").filter(Boolean);
    const items = lines.map((line) => {
      const parts = line.split(/\s+/);
      return {
        title: parts[0],
        definition: parts.slice(1).join(" "),
        type: "vocabulary",
        cefr: "B1",
        tags: ["导入"],
      };
    });

    const res = await fetch("/api/import/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    const d = await res.json();
    setImportResult(`导入 ${d.imported} 条，跳过 ${d.skipped} 条重复`);
    setImportText("");
    // 刷新列表
    setPage(1);
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📥 知识库</h2>

      {/* 搜索 + 筛选 */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="搜索..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">全部类型</option>
          <option value="vocabulary">词汇</option>
          <option value="grammar">语法</option>
          <option value="reading">阅读</option>
        </select>
      </div>

      {/* 统计 */}
      <p className="text-xs text-gray-500 mb-3">共 {total} 条知识点</p>

      {/* 列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">标题</th>
                <th className="text-left px-4 py-2 text-gray-600">类型</th>
                <th className="text-left px-4 py-2 text-gray-600">等级</th>
                <th className="text-left px-4 py-2 text-gray-600">主题</th>
              </tr>
            </thead>
            <tbody>
              {data.map((n: any) => (
                <tr key={n.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{n.title}</td>
                  <td className="px-4 py-2 text-gray-500">{n.type}</td>
                  <td className="px-4 py-2">
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{n.cefr}</span>
                  </td>
                  <td className="px-4 py-2 text-gray-500 text-xs">{n.topics?.join(", ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="text-center py-8 text-gray-400">暂无数据</div>
        )}
      </div>

      {/* 分页 */}
      {total > 20 && (
        <div className="flex gap-2 justify-center mb-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 cursor-pointer"
          >
            ← 上一页
          </button>
          <span className="px-3 py-1 text-sm text-gray-500">
            {page} / {Math.ceil(total / 20)}
          </span>
          <button
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 border rounded text-sm disabled:opacity-30 cursor-pointer"
          >
            下一页 →
          </button>
        </div>
      )}

      {/* 批量导入 */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">📥 批量导入</h3>
        <p className="text-xs text-gray-500 mb-2">
          每行一个单词，格式：<code>单词 释义</code>（空格分隔）
        </p>
        <textarea
          value={importText}
          onChange={(e) => setImportText(e.target.value)}
          rows={4}
          placeholder="apple 苹果&#10;book 书&#10;..."
          className="w-full p-3 border border-gray-300 rounded-lg text-sm mb-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={handleImport}
          disabled={!importText.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer"
        >
          导入
        </button>
        {importResult && (
          <p className="text-xs text-green-600 mt-2">{importResult}</p>
        )}
      </div>
    </div>
  );
}
