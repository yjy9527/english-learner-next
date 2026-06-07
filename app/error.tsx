"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("页面错误:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-lg font-bold text-gray-800 mb-2">页面出错了</h1>
        <p className="text-sm text-gray-500 mb-6">
          {error.message || "发生了意外错误，请重试"}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition cursor-pointer"
          >
            重试
          </button>
          <a
            href="/"
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
