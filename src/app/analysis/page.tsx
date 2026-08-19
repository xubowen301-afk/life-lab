"use client";

import { useState } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

const PRESETS = [
  { key: "sleep_mood", label: "睡眠时长 × 精力", icon: "😴" },
  { key: "coffee_sleep", label: "咖啡 × 睡眠", icon: "☕" },
  { key: "social_feeling", label: "社交类型分布", icon: "👥" },
  { key: "focus_work", label: "工作/学习 × 专注力", icon: "💻" },
  { key: "weather_mood", label: "天气 × 精力", icon: "🌤" },
  { key: "sleep_trend", label: "睡眠趋势", icon: "📈" }
];

const VARIABLES: { key: string; label: string }[] = [
  { key: "sleep_hours", label: "睡眠时长" },
  { key: "sleep_start_hour", label: "入睡时间" },
  { key: "coffee_ml", label: "咖啡摄入量" },
  { key: "coffee_time", label: "最晚咖啡时间" },
  { key: "energy", label: "精力" },
  { key: "focus", label: "专注力" },
  { key: "fatigue", label: "身体疲劳" },
  { key: "morning_spirit", label: "起床精神" },
  { key: "work_minutes", label: "工作/学习时长" },
  { key: "social_count", label: "社交次数" }
];

type AnalysisResult = {
  title: string;
  conclusion: string;
  data: unknown[];
  stats: Record<string, unknown>;
  chart: {
    type: string;
    xLabel?: string;
    yLabel?: string;
    data: { x: number; y: number }[];
  };
  reliability: string;
};

export default function AnalysisPage() {
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [varA, setVarA] = useState("sleep_hours");
  const [varB, setVarB] = useState("energy");
  const [days, setDays] = useState(30);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runPreset(key: string) {
    setActivePreset(key);
    setLoading(true);
    const res = await fetch(`/api/analysis?preset=${key}&days=${days}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  async function runFree() {
    setActivePreset(null);
    setLoading(true);
    const res = await fetch(`/api/analysis?varA=${varA}&varB=${varB}&days=${days}`);
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <div className="flex-1 py-8">
      <h2 className="text-3xl font-semibold tracking-normal mb-6">数据分析</h2>

      {/* 时间范围 */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-sm text-ink/50">时间范围</span>
        {[7, 30, 90, 365].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`rounded-md px-3 py-1 text-sm ${
              days === d ? "bg-ink text-paper" : "border border-line text-ink/60"
            }`}
          >
            {d >= 365 ? "最近一年" : `最近${d}天`}
          </button>
        ))}
      </div>

      {/* 预设问题 */}
      <section className="mb-10">
        <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-3">预设问题</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => runPreset(p.key)}
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-colors ${
                activePreset === p.key
                  ? "border-ink bg-ink/5"
                  : "border-line hover:border-ink/30"
              }`}
            >
              <span className="text-lg">{p.icon}</span>
              <span className="text-ink/70">{p.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* 自由分析 */}
      <section className="mb-10 p-4 rounded-lg border border-line bg-white/40">
        <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-3">自由分析</h3>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <span className="text-xs text-ink/40 block mb-1">变量 A</span>
            <select
              value={varA}
              onChange={(e) => setVarA(e.target.value)}
              className="rounded-md border border-line bg-white/60 px-2 py-2 text-sm text-ink"
            >
              {VARIABLES.map((v) => (
                <option key={v.key} value={v.key}>{v.label}</option>
              ))}
            </select>
          </div>
          <span className="text-ink/30 pb-2">×</span>
          <div>
            <span className="text-xs text-ink/40 block mb-1">变量 B</span>
            <select
              value={varB}
              onChange={(e) => setVarB(e.target.value)}
              className="rounded-md border border-line bg-white/60 px-2 py-2 text-sm text-ink"
            >
              {VARIABLES.map((v) => (
                <option key={v.key} value={v.key}>{v.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runFree}
            disabled={loading}
            className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-paper hover:opacity-85 disabled:opacity-50"
          >
            分析
          </button>
        </div>
      </section>

      {/* 加载状态 */}
      {loading && (
        <div className="py-16 text-center">
          <p className="text-sm text-ink/30">分析中…</p>
        </div>
      )}

      {/* 结果 */}
      {result && !loading && (
        <section className="space-y-6">
          {/* 结论 */}
          <div className="rounded-lg border border-line bg-white/40 p-5">
            <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-2">结论</h3>
            <p className="text-lg text-ink/80 leading-relaxed">{result.conclusion}</p>
          </div>

          {/* 图表 */}
          {result.chart?.data?.length > 0 && (
            <div className="rounded-lg border border-line bg-white/40 p-5">
              <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-4">图表</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {result.chart.type === "scatter" ? (
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ded9cc" />
                      <XAxis
                        dataKey="x"
                        name={result.chart.xLabel}
                        tick={{ fontSize: 12, fill: "#6f7d68" }}
                      />
                      <YAxis
                        dataKey="y"
                        name={result.chart.yLabel}
                        tick={{ fontSize: 12, fill: "#6f7d68" }}
                      />
                      <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                      <Scatter data={result.chart.data} fill="#6f7d68" />
                    </ScatterChart>
                  ) : result.chart.type === "bar" ? (
                    <BarChart data={result.chart.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ded9cc" />
                      <XAxis dataKey="x" tick={{ fontSize: 12, fill: "#6f7d68" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6f7d68" }} />
                      <Tooltip />
                      <Bar dataKey="y" fill="#6f7d68" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={result.chart.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ded9cc" />
                      <XAxis dataKey="x" tick={{ fontSize: 12, fill: "#6f7d68" }} />
                      <YAxis tick={{ fontSize: 12, fill: "#6f7d68" }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="y" stroke="#6f7d68" dot={false} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* 数据说明 */}
          <div className="rounded-lg border border-line bg-white/40 p-5">
            <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-2">数据说明</h3>
            <div className="space-y-1 text-sm text-ink/60">
              {Object.entries(result.stats).map(([key, value]) => (
                <p key={key}>
                  <span className="text-ink/35">{key}：</span>
                  {typeof value === "number" ? value.toFixed(2) : String(value)}
                </p>
              ))}
            </div>
          </div>

          {/* 可靠程度 */}
          <div className="rounded-lg border border-line bg-white/40 p-5">
            <h3 className="text-sm font-medium text-ink/50 uppercase tracking-wide mb-2">
              可靠程度 / 数据限制
            </h3>
            <p className="text-sm text-ink/60 leading-relaxed">{result.reliability}</p>
          </div>
        </section>
      )}
    </div>
  );
}