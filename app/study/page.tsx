export default function StudyPage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📖 学习</h2>
      {/* 子页签：闪卡 / 语法 / 词汇列表 */}
      <div className="flex gap-2 mb-4">
        {["🃏 单词闪卡", "📐 语法学习", "📋 词汇列表"].map((tab, i) => (
          <button
            key={i}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              i === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
        <div className="skeleton h-64 max-w-sm mx-auto" />
        <p className="text-sm text-gray-400 mt-4">闪卡学习组件（开发中）</p>
      </div>
    </div>
  );
}
