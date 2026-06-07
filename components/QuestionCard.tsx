"use client";

import { useState } from "react";

interface Question {
  id: number;
  type: string;
  stem: string;
  options?: string[];
  correct?: string;
  explanation?: string;
  source?: string;
  nodeTitle?: string;
}

export default function QuestionCard({
  question,
  index,
  total,
}: {
  question: Question;
  index: number;
  total: number;
}) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!answer.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/questions/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: question.id, userAnswer: answer }),
      });
      const data = await res.json();
      setResult(data);
      setSubmitted(true);
    } catch {
      setResult({ isCorrect: false, explanation: "提交失败" });
      setSubmitted(true);
    }
    setLoading(false);
  }

  const isWrong = question.source === "review";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 max-w-lg mx-auto">
      {/* 标签 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-gray-500">
          {index + 1} / {total}
        </span>
        {isWrong && (
          <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded">
            🔄 错题复习 ({question.nodeTitle})
          </span>
        )}
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
          {question.type === "multiple_choice" ? "选择题" : "填空题"}
        </span>
      </div>

      {/* 题干 */}
      <p className="text-base font-medium text-gray-800 mb-4">{question.stem}</p>

      {/* 选择题选项 */}
      {question.type === "multiple_choice" && question.options && (
        <div className="space-y-2 mb-4">
          {question.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            const isSelected = answer === letter || answer === opt;
            let bg = "bg-gray-50 hover:bg-gray-100";
            if (submitted && letter === question.correct) bg = "bg-green-50 border-green-300";
            if (submitted && isSelected && !result?.isCorrect) bg = "bg-red-50 border-red-300";

            return (
              <button
                key={i}
                onClick={() => !submitted && setAnswer(letter)}
                className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${bg} ${
                  isSelected && !submitted ? "border-primary bg-primary-light" : "border-gray-200"
                }`}
                disabled={submitted}
              >
                <span className="font-semibold text-gray-500 mr-2">{letter}.</span>
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* 填空题 */}
      {question.type === "fill_blank" && (
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitted}
          placeholder="输入答案..."
          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-50"
        />
      )}

      {/* 提交按钮 */}
      {!submitted && (
        <button
          onClick={submit}
          disabled={loading || !answer.trim()}
          className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 disabled:opacity-50 transition cursor-pointer"
        >
          {loading ? "提交中..." : "提交答案"}
        </button>
      )}

      {/* 结果 */}
      {submitted && result && (
        <div className={`mt-3 p-3 rounded-lg ${result.isCorrect ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <div className="font-semibold text-sm">
            {result.isCorrect ? "✅ 正确！" : `❌ 错误（正确答案：${result.correctAnswer}）`}
          </div>
          {result.explanation && (
            <p className="text-xs mt-1 opacity-80">{result.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
