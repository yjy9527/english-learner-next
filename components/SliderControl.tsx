"use client";

interface SliderControlProps {
  value: number;  // 0=严格, 1=标准, 2=强化
  onChange: (v: number) => void;
}

const marks = [
  { value: 0, label: "严格", desc: "SM-2 ±0 天" },
  { value: 1, label: "标准", desc: "SM-2 ±1 天" },
  { value: 2, label: "强化", desc: "SM-2 ±3 天" },
];

export default function SliderControl({ value, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 mb-1">
        {marks.map((m) => (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              value === m.value ? "text-primary font-semibold" : ""
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      <input
        type="range"
        min={0}
        max={2}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #4caf50, #ff9800, #f44336)`,
        }}
      />
      <div className="text-center text-xs text-primary font-medium mt-1">
        {marks[value].label} · {marks[value].desc}
      </div>
    </div>
  );
}
