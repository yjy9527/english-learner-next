"use client";

interface ModelSwitchProps {
  mode: "chat" | "think";
  onChange: (m: "chat" | "think") => void;
}

export default function ModelSwitch({ mode, onChange }: ModelSwitchProps) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-gray-500">🤖 模型：</span>
      <button
        onClick={() => onChange("chat")}
        className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
          mode === "chat" ? "bg-green-100 text-green-700 font-semibold" : "text-gray-400"
        }`}
      >
        ⚡ Chat
      </button>
      <button
        onClick={() => onChange("think")}
        className={`px-2.5 py-1 rounded-full transition cursor-pointer ${
          mode === "think" ? "bg-orange-100 text-orange-700 font-semibold" : "text-gray-400"
        }`}
      >
        🧠 思考
      </button>
    </div>
  );
}
