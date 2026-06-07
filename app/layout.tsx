import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "英语学习助手",
  description: "AI 驱动的英语学习系统",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "英语助手" },
};

/** 根布局——只提供 HTML 壳、字体、全局 CSS。导航由 MainApp 自行管理 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        {/* 防止暗色模式闪烁——在 HTML 渲染前同步执行 */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('el_theme');
                  if (theme === 'dark') {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-gray-50 dark:bg-slate-950 transition-colors">
        {children}
      </body>
    </html>
  );
}
