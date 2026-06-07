export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">⚙️ 设置</h2>
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 space-y-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">AI 提供商</div>
          <div className="flex gap-2">
            {["DeepSeek", "MiMo", "OpenAI", "自定义"].map((p, i) => (
              <button
                key={p}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  i === 0 ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">主题</div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600">☀️ 浅色</button>
            <button className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 text-gray-600">🌙 暗色</button>
          </div>
        </div>
        <p className="text-xs text-gray-400 pt-2">设置功能开发中</p>
      </div>
    </div>
  );
}
