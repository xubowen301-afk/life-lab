"use client";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex-1 flex items-center justify-center py-20">
      <div className="text-center">
        <p className="text-6xl mb-4">⚠️</p>
        <h2 className="text-xl font-semibold text-ink/70 mb-2">出了点问题</h2>
        <p className="text-sm text-ink/40 mb-6">{error.message || "未知错误"}</p>
        <button
          onClick={reset}
          className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-85"
        >
          重试
        </button>
      </div>
    </div>
  );
}