"use client";

type TimelineEntry = {
  time: string;
  type: string;
  icon: string;
  label: string;
  detail?: string;
  important?: boolean;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl">📋</p>
        <p className="mt-3 text-ink/50">今天还没有记录</p>
        <p className="text-sm text-ink/35">点击下方按钮开始记录你的生活</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* 竖线 */}
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-line" />

      <ul className="space-y-1">
        {entries.map((entry, i) => (
          <li key={i} className="relative flex items-start gap-3 pl-8 py-1.5">
            {/* 时间线圆点 */}
            <span className="absolute left-[5px] top-2.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-paper ring-1 ring-line text-[10px] leading-none">
              {entry.icon}
            </span>

            {/* 时间 */}
            <span className="min-w-[4.5rem] text-xs text-ink/40 font-mono pt-0.5">
              {formatTime(entry.time)}
            </span>

            {/* 内容 */}
            <div className="flex-1 min-w-0">
              <span className={`text-sm ${entry.important ? "font-semibold text-clay" : "text-ink/80"}`}>
                {entry.label}
              </span>
              {entry.detail && (
                <span className="ml-2 text-xs text-ink/40">{entry.detail}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}