"use client";

import { createContext, useContext } from "react";
import type { TabKey } from "@/components/MainApp";

/** Tab 切换上下文——让任何深层组件都能切换到指定 Tab */
export const TabContext = createContext<{
  activeTab: TabKey;
  switchTab: (tab: TabKey) => void;
} | null>(null);

/** 快捷 hook——获取 Tab 切换能力 */
export function useTabSwitch() {
  const ctx = useContext(TabContext);
  if (!ctx) throw new Error("useTabSwitch 必须在 MainApp 内使用");
  return ctx;
}
