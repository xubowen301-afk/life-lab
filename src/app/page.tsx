"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import TodayStatus from "@/components/TodayStatus";

type TodayData = {
  date: string;
  timeline: {
    time: string;
    type: string;
    icon: string;
    label: string;
    detail?: string;
    important?: boolean;
  }[];
  dailyRecord: {
    mood: string | null;
    energy: number | null;
    focus: number | null;
    bodyFatigue: number | null;
    morningSpirit: number | null;
    highPoint: string | null;
    lowPoint: string | null;
  } | null;
};

export default function TodayPage() {
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/today")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const todayStr = new Date().toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });

  return (
    <div className="flex-1 py-8">
      {/* 日期 */}
      <p className="text-sm text-sage mb-1">{todayStr}</p>
      <h2 className="text-3xl font-semibold tracking-normal mb-8">今天发生了什么？</h2>

      {/* 时间线 */}
      <section className="mb-10">
        {loading ? (
          <div className="py-16 text-center">
            <p className="text-sm text-ink/30">加载中…</p>
          </div>
        ) : (
          <Timeline entries={data?.timeline ?? []} />
        )}
      </section>

      {/* 今日状态 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink/60 uppercase tracking-wide">今日状态</h3>
        </div>
        <div className="rounded-lg border border-line bg-white/40 p-4">
          {loading ? (
            <div className="py-4 text-center">
              <p className="text-sm text-ink/30">加载中…</p>
            </div>
          ) : (
            <TodayStatus data={data?.dailyRecord ?? null} />
          )}
        </div>
      </section>

      {/* 添加记录按钮 */}
      <div className="mt-10 text-center">
        <Link
          href="/record"
          className="inline-flex items-center gap-2 rounded-md bg-ink px-5 py-2.5 text-sm font-medium text-paper transition-opacity hover:opacity-85"
        >
          ＋ 添加记录
        </Link>
      </div>
    </div>
  );
}