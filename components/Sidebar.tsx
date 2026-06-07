"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuGroups = [
  {
    label: "学习",
    items: [
      { href: "/", label: "仪表盘", icon: "📊" },
      { href: "/study", label: "学习", icon: "📖" },
      { href: "/review", label: "复习", icon: "🔄" },
      { href: "/practice", label: "练习", icon: "✏️" },
      { href: "/reading", label: "阅读", icon: "📄" },
    ],
  },
  {
    label: "数据",
    items: [
      { href: "/analysis", label: "分析", icon: "📈" },
      { href: "/knowledge", label: "知识库", icon: "📥" },
    ],
  },
  {
    label: "系统",
    items: [{ href: "/settings", label: "设置", icon: "⚙️" }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // 登录页不显示侧边栏
  if (pathname === "/login") return null;

  return (
    <aside className="hidden md:flex md:flex-col md:w-52 lg:w-56 bg-gray-50 border-r border-gray-200 h-screen sticky top-0 overflow-y-auto py-4 px-3 flex-shrink-0">
      <Link
        href="/"
        className="text-lg font-bold text-primary px-2 mb-6 hover:opacity-80 transition"
      >
        📚 英语助手
      </Link>

      {menuGroups.map((group) => (
        <div key={group.label} className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider px-2 mb-1">
            {group.label}
          </div>
          {group.items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm mb-0.5 transition ${
                  active
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
