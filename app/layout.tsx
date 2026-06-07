import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "英语学习助手",
  description: "AI 驱动的英语学习系统",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "英语助手" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
            {children}
          </main>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
