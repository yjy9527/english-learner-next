"use client";

import { TabKey, TAB_DEFS } from "@/components/MainApp";

interface SidebarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const menuGroups = [
  {
    label: "学习",
    keys: ["dashboard", "study", "review", "practice", "reading"] as TabKey[],
  },
  {
    label: "数据",
    keys: ["analysis", "knowledge"] as TabKey[],
  },
  {
    label: "系统",
    keys: ["settings"] as TabKey[],
  },
];

/** 桌面端侧边栏——纯按钮，支持暗色模式 */
export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex md:flex-col md:w-52 lg:w-56 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 h-screen sticky top-0 overflow-y-auto py-4 px-3 flex-shrink-0 transition-colors">
      {/* Logo */}
      <button
        onClick={() => onTabChange("dashboard")}
        className="text-lg font-bold text-primary px-2 mb-6 hover:opacity-80 transition text-left cursor-pointer"
      >
        📚 英语助手
      </button>

      {menuGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <div className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
            {group.label}
          </div>
          {group.keys.map((key) => {
            const tab = TAB_DEFS.find((t) => t.key === key)!;
            const active = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => onTabChange(key)}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm mb-0.5 transition w-full text-left cursor-pointer ${
                  active
                    ? "bg-primary-light text-primary font-semibold dark:bg-indigo-900/40 dark:text-indigo-300"
                    : "text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
