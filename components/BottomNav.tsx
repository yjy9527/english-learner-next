"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "仪表盘", icon: "📊" },
  { href: "/study", label: "学习", icon: "📖" },
  { href: "/review", label: "复习", icon: "🔄" },
  { href: "/practice", label: "练习", icon: "✏️" },
  { href: "/analysis", label: "分析", icon: "📈" },
];

export default function BottomNav() {
  const pathname = usePathname();

  // 登录页不显示导航
  if (pathname === "/login") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around py-1 safe-area-bottom">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-2 text-xs transition ${
                active ? "text-primary font-semibold" : "text-gray-500"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
