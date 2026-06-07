"use client";

import { useState, useEffect, useCallback } from "react";

export default function SettingsPage() {
  const [theme, setTheme] = useState("light");
  const [provider, setProvider] = useState("deepseek");
  const [customUrl, setCustomUrl] = useState("");
  const [customKey, setCustomKey] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 加载设置
  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => {
        if (c.theme) {
          setTheme(c.theme);
          document.documentElement.setAttribute("data-theme", c.theme);
          localStorage.setItem("el_theme", c.theme);
        }
        setProvider(c.provider || "deepseek");
        setCustomUrl(c.customBaseUrl || "");
        setCustomKey("");
        setCustomModel(c.customModel || "");
      })
      .catch(console.error)
      .finally(() => setLoaded(true));
  }, []);

  // 保存设置
  const save = useCallback(async (updates: Record<string, any>) => {
    setSaving(true);
    try {
      await fetch("/api/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {}
    setSaving(false);
  }, []);

  function toggleTheme(t: string) {
    setTheme(t);
    localStorage.setItem("el_theme", t);
    document.documentElement.setAttribute("data-theme", t);
    save({ theme: t });
  }

  function changeProvider(p: string) {
    setProvider(p);
    save({ provider: p });
  }

  function saveCustom() {
    save({ customBaseUrl: customUrl, customApiKey: customKey, customModel: customModel });
  }

  if (!loaded) {
    return <div className="p-4 md:p-6"><div className="skeleton h-8 w-32 mb-4" /><div className="skeleton h-40 rounded-lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ 设置</h2>
      {saving && <div className="fixed top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs shadow z-50">已保存</div>}

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
              onClick={() => changeProvider(p.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                provider === p.key ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {provider === "custom" && (
          <div className="space-y-2">
            <input type="text" placeholder="API Base URL" value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            <input type="password" placeholder="API Key" value={customKey}
              onChange={(e) => setCustomKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            <input type="text" placeholder="Model 名称" value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            <button onClick={saveCustom}
              className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs hover:bg-indigo-600 transition cursor-pointer">
              保存自定义配置
            </button>
          </div>
        )}
      </div>

      {/* 主题 */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 mb-4">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">🎨 主题</h3>
        <div className="flex gap-2">
          {["light", "dark"].map((t) => (
            <button key={t} onClick={() => toggleTheme(t)}
              className={`px-4 py-2 rounded-lg text-sm transition cursor-pointer ${
                theme === t ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
              }`}>
              {t === "light" ? "☀️ 浅色" : "🌙 暗色"}
            </button>
          ))}
        </div>
      </div>

      {/* 关于 */}
      <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-sm text-gray-700 mb-2">📋 关于</h3>
        <p className="text-sm text-gray-500">英语学习助手 v0.2.1</p>
        <p className="text-xs text-gray-400 mt-1">Next.js 16 + Neon Postgres + DeepSeek AI</p>
      </div>
    </div>
  );
}
