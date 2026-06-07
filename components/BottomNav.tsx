"use client";

import { TabKey } from "@/components/MainApp";

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const navItems: { key: TabKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "仪表盘", icon: "📊" },
  { key: "study", label: "学习", icon: "📖" },
  { key: "review", label: "复习", icon: "🔄" },
  { key: "practice", label: "练习", icon: "✏️" },
  { key: "analysis", label: "分析", icon: "📈" },
];

/** 移动端底部导航——纯按钮，支持暗色模式 */
export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 z-50 transition-colors">
      <div className="flex justify-around py-1 safe-area-bottom">
        {navItems.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`flex flex-col items-center py-1 px-2 text-xs transition cursor-pointer ${
                active
                  ? "text-primary font-semibold dark:text-indigo-300"
                  : "text-gray-500 dark:text-slate-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
