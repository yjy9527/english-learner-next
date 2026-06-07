"use client";

import { useEffect, useState } from "react";
import QuestionCard from "@/components/QuestionCard";
import SliderControl from "@/components/SliderControl";
import ModelSwitch from "@/components/ModelSwitch";

type PracticeMode = "daily" | "wrong" | "exam";

interface Question {
  id: number;
  type: string;
  stem: string;
  options?: string[];
  correct?: string;
  source?: string;
  nodeTitle?: string;
}

export default function PracticePage() {
  const [mode, setMode] = useState<PracticeMode>("daily");
  const [aiMode, setAiMode] = useState<"chat" | "think">("chat");
  const [tolerance, setTolerance] = useState(1);
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startPractice() {
    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      if (mode === "wrong") {
        // 错题重练：从已有答题记录中抽取错题
        const res = await fetch("/api/knowledge?pageSize=100");
        const data = await res.json();
        // 拉知识点，找有答题记录的错题
        const nodeIds = data.data.map((n: any) => n.id);
        const qRes = await fetch("/api/questions/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeIds: nodeIds.slice(0, 10),
            count,
            mode: aiMode,
            tolerance: 2, // 强化宽容度，尽量多出
          }),
        });
        const qData = await qRes.json();
        if (qData.error) throw new Error(qData.error);
        // 过滤只保留错题
        setQuestions(qData.questions.filter((q: Question) => q.source === "review"));
      } else if (mode === "exam") {
        // 模拟考试
        const res = await fetch("/api/questions/exam", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ count: 15, mode: aiMode }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setQuestions(data.questions);
      } else {
        // 日常练习：选词汇知识点出题
        const res = await fetch("/api/knowledge?type=vocabulary&pageSize=10");
        const data = await res.json();
        const nodeIds = data.data.map((n: any) => n.id);

        const qRes = await fetch("/api/questions/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodeIds, count, mode: aiMode, tolerance }),
        });
        const qData = await qRes.json();
        if (qData.error) throw new Error(qData.error);
        setQuestions(qData.questions);
      }
    } catch (e: any) {
      setError(e.message || "出题失败");
    }
    setLoading(false);
  }

  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">✏️ 练习</h2>

      {/* 模式选择 */}
      <div className="flex gap-3 mb-6">
        {[
          { key: "daily", label: "✏️ 日常练习", desc: "AI 新题 + 错题混入" },
          { key: "wrong", label: "🔄 错题重练", desc: "免费秒出" },
          { key: "exam", label: "📋 模拟考试", desc: "AI 出卷" },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key as PracticeMode); setQuestions([]); }}
            className={`flex-1 p-3 rounded-lg text-left border-2 transition cursor-pointer ${
              mode === m.key
                ? "border-primary bg-primary-light"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="text-sm font-semibold">{m.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* 设置区 */}
      {questions.length === 0 && (
        <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 space-y-4 max-w-md">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">题目数量</div>
            <div className="flex gap-1">
              {[5, 10, 15].map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`px-3 py-1 rounded text-sm cursor-pointer ${
                    count === n ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <ModelSwitch mode={aiMode} onChange={setAiMode} />

          {mode === "daily" && (
            <div>
              <div className="text-sm text-gray-600 mb-2">错题复习宽容度</div>
              <SliderControl value={tolerance} onChange={setTolerance} />
            </div>
          )}

          <button
            onClick={startPractice}
            disabled={loading}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer"
          >
            {loading
              ? "🤖 AI 出题中..." + (aiMode === "think" ? "（思考模型较慢，约 5-8 秒）" : "（约 1-2 秒）")
              : mode === "exam"
              ? "🤖 AI 出卷（15 题）"
              : `🤖 开始练习（${count} 题）`}
          </button>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
          )}
        </div>
      )}

      {/* 题目区域 */}
      {questions.length > 0 && (
        <div className="space-y-4">
          {questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i} total={questions.length} />
          ))}

          <button
            onClick={() => setQuestions([])}
            className="w-full py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            🔄 重新出题
          </button>
        </div>
      )}
    </div>
  );
}
