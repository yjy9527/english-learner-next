"use client";

import { useState, useEffect } from "react";

interface CardData {
  id: number;
  title: string;
  detail: any;
  cefr: string;
  tags: string[];
}

export default function FlashCard({ cards: initialCards }: { cards: CardData[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [cards] = useState(initialCards);

  // 切换卡片时重置翻转
  useEffect(() => {
    setFlipped(false);
  }, [index]);

  if (!cards.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-2">📭</p>
        <p>暂无单词，请先导入词汇数据</p>
      </div>
    );
  }

  const card = cards[index];

  function prev() {
    setIndex((i) => (i > 0 ? i - 1 : cards.length - 1));
  }
  function next() {
    setIndex((i) => (i < cards.length - 1 ? i + 1 : 0));
  }

  function speak() {
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(card.title);
      utter.lang = "en-US";
      utter.rate = 0.8;
      speechSynthesis.speak(utter);
    }
  }

  return (
    <div className="flex flex-col items-center">
      {/* 计数器 */}
      <div className="text-sm text-gray-500 mb-4">
        {index + 1} / {cards.length}
      </div>

      {/* 卡片 */}
      <div
        className="w-full max-w-sm aspect-[3/2] cursor-pointer mb-6"
        onClick={() => setFlipped(!flipped)}
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
            <div className="text-sm text-gray-400">{card.cefr}</div>
            <button
              onClick={(e) => { e.stopPropagation(); speak(); }}
              className="mt-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-lg transition cursor-pointer"
              title="朗读"
            >
              🔊
            </button>
            <div className="text-xs text-gray-400 mt-4">点击翻转查看释义</div>
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
              <div className="text-sm text-gray-500 mb-2">{card.detail.part_of_speech}</div>
            )}
            {card.detail?.example && (
              <div className="text-xs text-gray-500 italic mt-2 text-center">
                &ldquo;{card.detail.example}&rdquo;
              </div>
            )}
            {card.tags?.length > 0 && (
              <div className="flex gap-1 mt-3 flex-wrap justify-center">
                {card.tags.map((t: string) => (
                  <span
                    key={t}
                    className="text-xs bg-primary-light text-primary px-2 py-0.5 rounded-full"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <button
          onClick={prev}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer"
        >
          ⬅ 上一个
        </button>
        <button
          onClick={next}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition cursor-pointer"
        >
          下一个 ➡
        </button>
      </div>
    </div>
  );
}
