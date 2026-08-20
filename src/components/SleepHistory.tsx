"use client";

import { useEffect, useState } from "react";

type SleepRow = {
  date: string;
  sleepStart: string;
  sleepEnd: string;
  duration: string;
};

export default function SleepHistory() {
  const [rows, setRows] = useState<SleepRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis?preset=sleep_history&days=30")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setRows(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-ink/30 py-4 text-center">加载中…</p>;
  }

  if (rows.length === 0) {
    return <p className="text-sm text-ink/40 py-4 text-center">暂无睡眠记录</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-ink/40 uppercase tracking-wide">
            <th className="py-2 pr-3 font-medium">日期</th>
            <th className="py-2 pr-3 font-medium">入睡</th>
            <th className="py-2 pr-3 font-medium">起床</th>
            <th className="py-2 font-medium text-right">时长</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.date} className="border-b border-line/50 hover:bg-white/40">
              <td className="py-2 pr-3 text-ink/60 font-mono text-xs">{r.date.slice(5)}</td>
              <td className="py-2 pr-3 text-ink/70">{r.sleepStart}</td>
              <td className="py-2 pr-3 text-ink/70">{r.sleepEnd}</td>
              <td className="py-2 text-right text-ink/50 font-mono text-xs">{r.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}