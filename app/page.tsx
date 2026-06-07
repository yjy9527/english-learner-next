export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📊 仪表盘</h2>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {["已学单词", "掌握率", "今日待复习", "累计练习"].map((label, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
            <div className="text-xs text-gray-500 mb-1">{label}</div>
            <div className="skeleton h-7 w-12" />
          </div>
        ))}
      </div>

      {/* 图表区 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">知识点类型分布</h3>
          <div className="skeleton h-48 w-full" />
        </div>
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">CEFR 等级分布</h3>
          <div className="skeleton h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
