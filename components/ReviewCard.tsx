"use client";

import { useState, useEffect } from "react";

interface Card {
  scheduleId: number;
  nodeId: number;
  title: string;
  type: string;
  cefr: string;
  detail: any;
}

export default function ReviewCard({
  card,
  onDone,
}: {
  card: Card;
  onDone: () => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const [graded, setGraded] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleGrade(rating: number) {
    setGraded(true);
    try {
      const res = await fetch("/api/review/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: card.nodeId, rating }),
      });
      const data = await res.json();
      setResult(
        `下次复习：${data.nextReviewAt}（间隔 ${data.intervalDays} 天）`
      );
    } catch {
      setResult("评分失败，请重试");
      setGraded(false);
    }
  }

  // 键盘操作
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!graded && flipped) {
        if (["0", "3", "4", "5"].includes(e.key)) {
          handleGrade(Number(e.key));
        }
      }
      if ([" ", "Enter"].includes(e.key)) {
        e.preventDefault();
        if (graded) onDone();
        else setFlipped((f) => !f);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, graded, onDone]);

  const ratingButtons = [
    { rating: 0, label: "完全忘了", color: "bg-red-500 hover:bg-red-600" },
    { rating: 3, label: "勉强想起", color: "bg-orange-500 hover:bg-orange-600" },
    { rating: 4, label: "有点犹豫", color: "bg-blue-500 hover:bg-blue-600" },
    { rating: 5, label: "完美回忆", color: "bg-green-500 hover:bg-green-600" },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* 卡片 */}
      <div
        className="w-full max-w-sm aspect-[3/2] cursor-pointer mb-4"
        onClick={() => !graded && setFlipped(!flipped)}
        style={{ perspective: "800px" }}
      >
        <div
          className="relative w-full h-full transition-transform duration-400 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* 正面——单词 */}
          <div
            className="absolute inset-0 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-3xl font-bold text-gray-800 mb-2">{card.title}</div>
            <div className="text-sm text-gray-400">{card.cefr} · {card.type}</div>
            <div className="text-xs text-gray-400 mt-6">点击翻转查看释义</div>
          </div>

          {/* 背面——释义 */}
          <div
            className="absolute inset-0 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <div className="text-lg font-semibold text-gray-800 mb-2">
              {card.detail?.definition_cn || "暂无释义"}
            </div>
            {card.detail?.part_of_speech && (
              <div className="text-sm text-gray-500">{card.detail.part_of_speech}</div>
            )}
          </div>
        </div>
      </div>

      {/* 评分结果 */}
      {result && (
        <div className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg mb-3">
          {result}
        </div>
      )}

      {/* 评分按钮 */}
      {!graded && flipped && (
        <div className="flex flex-wrap justify-center gap-2">
          {ratingButtons.map((btn) => (
            <button
              key={btn.rating}
              onClick={() => handleGrade(btn.rating)}
              className={`${btn.color} text-white px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer`}
            >
              {btn.label}（{btn.rating}）
            </button>
          ))}
        </div>
      )}

      {/* 下一张 */}
      {graded && (
        <button
          onClick={onDone}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-indigo-600 transition cursor-pointer"
        >
          下一张 →
        </button>
      )}
    </div>
  );
}
