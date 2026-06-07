export default function KnowledgePage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📥 知识库</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 text-center">
        <div className="skeleton h-32 max-w-sm mx-auto mb-4" />
        <p className="text-sm text-gray-400">搜索 + 筛选 + 批量导入（开发中）</p>
      </div>
    </div>
  );
}
