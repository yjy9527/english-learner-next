"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [provider, setProvider] = useState("deepseek");
  const [showCustom, setShowCustom] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [customModel, setCustomModel] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("el_theme") || "light";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggleTheme(t: string) {
    setTheme(t);
    localStorage.setItem("el_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ 设置</h2>

      {/* AI 提供商 */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">🤖 AI 提供商</h3>
        <div className="flex gap-2 flex-wrap mb-3">
          {[
            { key: "deepseek", label: "DeepSeek" },
            { key: "mimo", label: "MiMo" },
            { key: "openai", label: "OpenAI" },
            { key: "custom", label: "自定义" },
          ].map((p) => (
            <button
              key={p.key}
              onClick={() => {
                setProvider(p.key);
                setShowCustom(p.key === "custom");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                provider === p.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* 自定义输入框 */}
        {showCustom && (
          <div className="space-y-2">
            <input
              type="text" placeholder="API Base URL (如 https://api.openai.com/v1)"
              value={customUrl} onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
            <input
              type="password" placeholder="API Key"
              value={customKey} onChange={(e) => setCustomKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
            <input
              type="text" placeholder="Model 名称 (如 gpt-4o-mini)"
              value={customModel} onChange={(e) => setCustomModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
            />
          </div>
        )}
      </div>

      {/* 主题 */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">🎨 主题</h3>
        <div className="flex gap-2">
          <button
            onClick={() => toggleTheme("light")}
            className={`px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
              theme === "light" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            ☀️ 浅色
          </button>
          <button
            onClick={() => toggleTheme("dark")}
            className={`px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
              theme === "dark" ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
            }`}
          >
            🌙 暗色
          </button>
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">📋 关于</h3>
        <p className="text-sm text-gray-500">英语学习助手 v0.2.0</p>
        <p className="text-xs text-gray-400 mt-1">Next.js 16 + Neon Postgres + DeepSeek AI</p>
      </div>
    </div>
  );
}
