"use client";

import { useState } from "react";
import QuestionCard from "@/components/QuestionCard";

export default function ReadingPage() {
  const [cefr, setCefr] = useState("B1");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch("/api/reading/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cefr }),
      });
      const d = await res.json();
      if (d.error) throw new Error(d.error);
      setData(d);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📄 AI 阅读</h2>

      {!data && (
        <div className="max-w-md space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">难度等级</label>
            <div className="flex gap-1">
              {["A1", "A2", "B1", "B2"].map((l) => (
                <button
                  key={l}
                  onClick={() => setCefr(l)}
                  className={`px-3 py-1 rounded text-sm cursor-pointer ${
                    cefr === l ? "bg-primary text-white" : "bg-gray-100"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer"
          >
            {loading ? "🤖 AI 生成中..." : "📖 生成阅读材料"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      )}

      {data && (
        <div className="space-y-6 max-w-2xl">
          <h3 className="text-lg font-bold">{data.title}</h3>
          <div className="bg-white rounded-lg p-5 shadow-sm border leading-relaxed whitespace-pre-line text-gray-700">
            {data.content}
          </div>
          {data.vocabulary?.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-sm mb-2">📝 生词注释</h4>
              <div className="flex flex-wrap gap-2">
                {data.vocabulary.map((v: any, i: number) => (
                  <span key={i} className="text-xs bg-white border px-2 py-1 rounded">
                    <strong>{v.word}</strong> {v.definition}
                  </span>
                ))}
              </div>
            </div>
          )}
          {data.questions?.map((q: any, i: number) => (
            <QuestionCard key={i} question={{ ...q, id: i, type: q.type || "multiple_choice" }} index={i} total={data.questions.length} />
          ))}
          <button
            onClick={() => setData(null)}
            className="w-full py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            🔄 重新生成
          </button>
        </div>
      )}
    </div>
  );
}
