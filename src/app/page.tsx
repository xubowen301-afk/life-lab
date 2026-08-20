"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Timeline from "@/components/Timeline";
import TodayStatus from "@/components/TodayStatus";
import DailyTrend from "@/components/DailyTrend";
import SleepHistory from "@/components/SleepHistory";

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

function formatDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function isToday(date: Date) {
  return formatDateStr(date) === formatDateStr(new Date());
}

export default function TodayPage() {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [data, setData] = useState<TodayData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDate = useCallback((date: Date) => {
    setLoading(true);
    fetch(`/api/today?date=${formatDateStr(date)}`)
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDate(viewDate);
  }, [viewDate, fetchDate]);

  function goToPrevDay() {
    const d = new Date(viewDate);
    d.setDate(d.getDate() - 1);
    setViewDate(d);
  }

  function goToNextDay() {
    const d = new Date(viewDate);
    d.setDate(d.getDate() + 1);
    // 不能超过今天
    if (d <= new Date()) {
      setViewDate(d);
    }
  }

  function goToToday() {
    setViewDate(new Date());
  }

  const canGoNext = !isToday(viewDate);

  return (
    <div className="flex-1 py-8">
      {/* 日期导航 */}
      <div className="flex items-center gap-3 mb-1">
        <button
          onClick={goToPrevDay}
          className="rounded p-1 text-ink/40 hover:text-ink hover:bg-white/60 transition-colors"
          title="前一天"
        >
          ←
        </button>
        <p className="text-sm text-sage">{formatDisplayDate(viewDate)}</p>
        {canGoNext && (
          <button
            onClick={goToNextDay}
            className="rounded p-1 text-ink/40 hover:text-ink hover:bg-white/60 transition-colors"
            title="后一天"
          >
            →
          </button>
        )}
        {!isToday(viewDate) && (
          <button
            onClick={goToToday}
            className="text-xs text-sage underline underline-offset-2 ml-2"
          >
            回到今天
          </button>
        )}
      </div>
      <h2 className="text-3xl font-semibold tracking-normal mb-8">
        {isToday(viewDate) ? "今天发生了什么？" : `${viewDate.getMonth() + 1}月${viewDate.getDate()}日`}
      </h2>

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

      {/* 当日状态 */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-ink/60 uppercase tracking-wide">当日状态</h3>
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

      {/* 30天趋势 */}
      <section className="mb-10">
        <h3 className="text-sm font-medium text-ink/60 uppercase tracking-wide mb-3">近 30 天趋势</h3>
        <div className="rounded-lg border border-line bg-white/40 p-4">
          <DailyTrend />
        </div>
      </section>

      {/* 睡眠历史 */}
      <section className="mb-10">
        <h3 className="text-sm font-medium text-ink/60 uppercase tracking-wide mb-3">睡眠记录</h3>
        <div className="rounded-lg border border-line bg-white/40 p-4">
          <SleepHistory />
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