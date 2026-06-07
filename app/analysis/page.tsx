export default function AnalysisPage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📈 学习分析</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="skeleton h-32 rounded-lg" />
        <div className="skeleton h-32 rounded-lg" />
      </div>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-400">AI 诊断 + 图表（开发中）</p>
      </div>
    </div>
  );
}
