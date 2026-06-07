"use client";

import { useState, useCallback, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import DashboardTab from "@/components/DashboardTab";
import StudyTab from "@/components/StudyTab";
import ReviewTab from "@/components/ReviewTab";
import PracticeTab from "@/components/PracticeTab";
import ReadingTab from "@/components/ReadingTab";
import AnalysisTab from "@/components/AnalysisTab";
import KnowledgeTab from "@/components/KnowledgeTab";
import SettingsTab from "@/components/SettingsTab";
import { TabContext } from "@/lib/tab-context";

/** 所有 Tab 类型 */
export type TabKey = "dashboard" | "study" | "review" | "practice" | "reading" | "analysis" | "knowledge" | "settings";

/** Tab 定义 */
export const TAB_DEFS: { key: TabKey; label: string; icon: string; group: string }[] = [
  { key: "dashboard", label: "仪表盘", icon: "📊", group: "学习" },
  { key: "study", label: "学习", icon: "📖", group: "学习" },
  { key: "review", label: "复习", icon: "🔄", group: "学习" },
  { key: "practice", label: "练习", icon: "✏️", group: "学习" },
  { key: "reading", label: "阅读", icon: "📄", group: "学习" },
  { key: "analysis", label: "分析", icon: "📈", group: "数据" },
  { key: "knowledge", label: "知识库", icon: "📥", group: "数据" },
  { key: "settings", label: "设置", icon: "⚙️", group: "系统" },
];

/** Tab 组件查找表 */
const TAB_COMPONENTS: Record<TabKey, React.ComponentType> = {
  dashboard: DashboardTab,
  study: StudyTab,
  review: ReviewTab,
  practice: PracticeTab,
  reading: ReadingTab,
  analysis: AnalysisTab,
  knowledge: KnowledgeTab,
  settings: SettingsTab,
};

/**
 * 单个 Tab 面板——首次访问后始终保留在 DOM 中
 * 切换不可见 Tab 通过 display:none，不销毁 React 组件树
 */
function TabPanel({ tabKey, active }: { tabKey: TabKey; active: boolean }) {
  const [hasRendered, setHasRendered] = useState(active);

  useEffect(() => {
    if (active && !hasRendered) setHasRendered(true);
  }, [active, hasRendered]);

  if (!hasRendered) return null;

  const Comp = TAB_COMPONENTS[tabKey];

  return (
    <div
      className={active ? "tab-enter" : ""}
      style={{ display: active ? "block" : "none" }}
    >
      <Comp />
    </div>
  );
}

/**
 * 主应用——单页 SPA 容器
 * 所有模块按需首次渲染后常驻内存，Tab 切换瞬间完成
 */
export default function MainApp() {
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");

  const switchTab = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  // 首次加载从 localStorage 恢复主题
  useEffect(() => {
    const saved = localStorage.getItem("el_theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  return (
    <TabContext.Provider value={{ activeTab, switchTab }}>
      <div className="flex min-h-screen">
        {/* 桌面端侧边栏 */}
        <Sidebar activeTab={activeTab} onTabChange={switchTab} />

        {/* 主内容区 */}
        <main className="flex-1 pb-16 md:pb-0 overflow-y-auto">
          {(Object.keys(TAB_COMPONENTS) as TabKey[]).map((key) => (
            <TabPanel key={key} tabKey={key} active={activeTab === key} />
          ))}
        </main>

        {/* 移动端底部导航 */}
        <BottomNav activeTab={activeTab} onTabChange={switchTab} />
      </div>
    </TabContext.Provider>
  );
}
