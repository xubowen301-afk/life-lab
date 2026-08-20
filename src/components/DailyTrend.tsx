"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type TrendPoint = {
  date: string;
  energy: number | null;
  focus: number | null;
  bodyFatigue: number | null;
  morningSpirit: number | null;
};

export default function DailyTrend() {
  const [data, setData] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analysis?preset=daily_trend&days=30")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-ink/30">加载趋势…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="py-4 text-center">
        <p className="text-sm text-ink/40">尚无足够数据，开始记录每日状态后这里会显示趋势</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    energy: d.energy,
    focus: d.focus,
    fatigue: d.bodyFatigue,
    spirit: d.morningSpirit
  }));

  return (
    <div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ded9cc" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6f7d68" }} interval="preserveStartEnd" />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: "#6f7d68" }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="energy" stroke="#6f7d68" name="精力" dot={false} strokeWidth={1.5} />
            <Line type="monotone" dataKey="focus" stroke="#9c6f56" name="专注力" dot={false} strokeWidth={1.5} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}