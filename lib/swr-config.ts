import { SWRConfiguration } from "swr";

/** 全局 SWR 配置——缓存优先，不重复请求 */
export const swrConfig: SWRConfiguration = {
  revalidateOnFocus: false,     // 切回标签页不重新请求
  revalidateOnMount: false,     // ⚡ 挂载时用缓存，不重新请求
  revalidateIfStale: false,     // ⚡ 有过期缓存也不自动刷新
  dedupingInterval: 60000,      // 60 秒内相同请求去重
  errorRetryCount: 2,           // 失败最多重试 2 次
};

/** 通用 fetcher */
export const fetcher = (url: string) => fetch(url).then((r) => {
  if (!r.ok) throw new Error(`API ${r.status}`);
  return r.json();
});
