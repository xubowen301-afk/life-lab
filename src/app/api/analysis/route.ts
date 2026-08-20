import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEMP_USER_ID = "default-user";

// 计算 Pearson 相关系数
function pearsonCorrelation(xs: number[], ys: number[]): number | null {
  if (xs.length < 3 || xs.length !== ys.length) return null;
  const n = xs.length;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? null : num / den;
}

// 计算平均值
function avg(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const preset = searchParams.get("preset");
  const varA = searchParams.get("varA");
  const varB = searchParams.get("varB");
  const days = parseInt(searchParams.get("days") || "30");

  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  try {
    // ─── 预设分析 ──────────────────────────────────
    if (preset) {
      return handlePreset(preset, since, days);
    }

    // ─── 自由分析 ──────────────────────────────────
    if (varA && varB) {
      return handleFreeAnalysis(varA, varB, since, days);
    }

    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  } catch (error) {
    console.error("分析失败:", error);
    return NextResponse.json({ error: "分析失败" }, { status: 500 });
  }
}

async function handlePreset(preset: string, since: Date, days: number) {
  switch (preset) {
    case "sleep_mood": {
      const sleeps = await prisma.sleepRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } },
        orderBy: { date: "asc" }
      });
      const dailyMap = new Map<string, number>();
      const dailies = await prisma.dailyRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } }
      });
      for (const d of dailies) {
        if (d.energy !== null) {
          dailyMap.set(d.date.toISOString().slice(0, 10), d.energy);
        }
      }

      const pairs: { sleepHours: number; energy: number; date: string }[] = [];
      for (const s of sleeps) {
        const dateKey = s.date.toISOString().slice(0, 10);
        const energy = dailyMap.get(dateKey);
        if (s.durationMinutes && energy !== undefined) {
          pairs.push({ sleepHours: s.durationMinutes / 60, energy, date: dateKey });
        }
      }

      const x = pairs.map((p) => p.sleepHours);
      const y = pairs.map((p) => p.energy);
      const r = pearsonCorrelation(x, y);

      return NextResponse.json({
        title: "睡眠时长 × 精力",
        conclusion: r
          ? `近${pairs.length}天数据，睡眠时长与精力${r > 0.2 ? "呈正相关" : r < -0.2 ? "呈负相关" : "无明显相关性"}（r = ${r.toFixed(3)}）`
          : "数据不足，无法计算相关性",
        data: pairs,
        stats: {
          avgSleepHours: avg(x),
          avgEnergy: avg(y),
          sampleSize: pairs.length,
          correlation: r
        },
        chart: {
          type: "scatter",
          xLabel: "睡眠时长（小时）",
          yLabel: "精力",
          data: pairs.map((p) => ({ x: +p.sleepHours.toFixed(1), y: p.energy }))
        },
        reliability: r
          ? `样本量：${pairs.length}天。相关系数 r = ${r.toFixed(3)}。${Math.abs(r) < 0.3 ? "相关性较弱，需要更多数据。" : Math.abs(r) < 0.6 ? "存在中等相关性。" : "相关性较强。"} 注意：相关性不代表因果关系。`
          : `样本量不足（${pairs.length}天），无法得出可靠结论。`
      });
    }

    case "coffee_sleep": {
      const coffees = await prisma.coffeeRecord.findMany({
        where: { userId: TEMP_USER_ID, time: { gte: since } },
        orderBy: { time: "asc" }
      });
      const sleeps = await prisma.sleepRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } },
        orderBy: { date: "asc" }
      });

      // 按日期聚合咖啡摄入量
      const coffeeByDate = new Map<string, { totalMl: number; lastTime: number }>();
      for (const c of coffees) {
        const key = c.time.toISOString().slice(0, 10);
        const entry = coffeeByDate.get(key) || { totalMl: 0, lastTime: 0 };
        entry.totalMl += c.amountMl;
        entry.lastTime = Math.max(entry.lastTime, c.time.getHours());
        coffeeByDate.set(key, entry);
      }

      const pairs: { date: string; totalMl: number; lastHour: number; sleepHours: number }[] = [];
      for (const s of sleeps) {
        const key = s.date.toISOString().slice(0, 10);
        const coffee = coffeeByDate.get(key);
        if (coffee && s.durationMinutes) {
          pairs.push({
            date: key,
            totalMl: coffee.totalMl,
            lastHour: coffee.lastTime,
            sleepHours: s.durationMinutes / 60
          });
        }
      }

      const r = pearsonCorrelation(
        pairs.map((p) => p.totalMl),
        pairs.map((p) => p.sleepHours)
      );

      return NextResponse.json({
        title: "咖啡摄入量 × 睡眠时长",
        conclusion: r
          ? `近${pairs.length}天数据，咖啡摄入量与睡眠时长${r < -0.2 ? "呈负相关" : r > 0.2 ? "呈正相关" : "无明显相关性"}（r = ${r.toFixed(3)}）`
          : "数据不足",
        data: pairs,
        stats: {
          avgCoffeeMl: avg(pairs.map((p) => p.totalMl)),
          avgSleepHours: avg(pairs.map((p) => p.sleepHours)),
          sampleSize: pairs.length,
          correlation: r
        },
        chart: {
          type: "scatter",
          xLabel: "咖啡摄入量 (ml)",
          yLabel: "睡眠时长（小时）",
          data: pairs.map((p) => ({ x: p.totalMl, y: +p.sleepHours.toFixed(1) }))
        },
        reliability: r
          ? `样本量：${pairs.length}天。注意：未考虑咖啡饮用时间，仅按日总量计算。`
          : "数据不足，无法得出可靠结论。"
      });
    }

    case "social_feeling": {
      const socials = await prisma.socialRecord.findMany({
        where: { userId: TEMP_USER_ID, startTime: { gte: since } },
        orderBy: { startTime: "asc" }
      });

      const byType = new Map<string, number>();
      for (const s of socials) {
        if (!byType.has(s.type)) byType.set(s.type, 0);
        byType.set(s.type, byType.get(s.type)! + 1);
      }

      const types = Array.from(byType.entries()).map(([name, count]) => ({ name, count }));

      return NextResponse.json({
        title: "社交类型分布",
        conclusion: `近${days}天共${socials.length}次社交记录。${types.length > 0 ? `最常见的社交类型是「${types.sort((a, b) => b.count - a.count)[0].name}」。` : ""}`,
        data: types,
        stats: { totalSocials: socials.length, uniqueTypes: types.length },
        chart: {
          type: "bar",
          xLabel: "社交类型",
          yLabel: "次数",
          data: types.map((t) => ({ x: t.name, y: t.count }))
        },
        reliability: `样本量：${socials.length}次社交记录。社交感受为自由文本，暂未做情感分析。`
      });
    }

    case "focus_work": {
      const works = await prisma.workRecord.findMany({
        where: { userId: TEMP_USER_ID, startTime: { gte: since } },
        orderBy: { startTime: "asc" }
      });
      const dailies = await prisma.dailyRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } }
      });
      const focusMap = new Map<string, number>();
      for (const d of dailies) {
        if (d.focus !== null) focusMap.set(d.date.toISOString().slice(0, 10), d.focus);
      }

      const dateWork = new Map<string, number>();
      for (const w of works) {
        const key = w.startTime.toISOString().slice(0, 10);
        dateWork.set(key, (dateWork.get(key) || 0) + (w.durationMinutes || 0));
      }

      const pairs: { date: string; workMinutes: number; focus: number }[] = [];
      for (const [date, mins] of dateWork) {
        const focus = focusMap.get(date);
        if (focus !== undefined) pairs.push({ date, workMinutes: mins, focus });
      }

      const r = pearsonCorrelation(
        pairs.map((p) => p.workMinutes),
        pairs.map((p) => p.focus)
      );

      return NextResponse.json({
        title: "工作/学习时长 × 专注力",
        conclusion: r
          ? `近${pairs.length}天数据，工作时长与专注力${r > 0.2 ? "呈正相关" : r < -0.2 ? "呈负相关" : "无明显相关性"}（r = ${r.toFixed(3)}）`
          : "数据不足",
        data: pairs,
        stats: { sampleSize: pairs.length, correlation: r },
        chart: {
          type: "scatter",
          xLabel: "工作/学习时长（分钟）",
          yLabel: "专注力",
          data: pairs.map((p) => ({ x: p.workMinutes, y: p.focus }))
        },
        reliability: r ? `样本量：${pairs.length}天。相关性不代表因果关系。` : "数据不足。"
      });
    }

    case "weather_mood": {
      const weathers = await prisma.weatherRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } }
      });
      const dailies = await prisma.dailyRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } }
      });
      const energyMap = new Map<string, number>();
      for (const d of dailies) {
        if (d.energy !== null) energyMap.set(d.date.toISOString().slice(0, 10), d.energy);
      }

      const byCondition = new Map<string, number[]>();
      for (const w of weathers) {
        const key = w.date.toISOString().slice(0, 10);
        const energy = energyMap.get(key);
        if (w.condition && energy !== undefined) {
          if (!byCondition.has(w.condition)) byCondition.set(w.condition, []);
          byCondition.get(w.condition)!.push(energy);
        }
      }

      const summary = Array.from(byCondition.entries()).map(([condition, energies]) => ({
        condition,
        avgEnergy: +(energies.reduce((a, b) => a + b, 0) / energies.length).toFixed(1),
        count: energies.length
      }));

      return NextResponse.json({
        title: "天气 × 精力",
        conclusion: summary.length > 0
          ? `精力最高的天气是「${summary.sort((a, b) => b.avgEnergy - a.avgEnergy)[0].condition}」，平均精力 ${summary[0].avgEnergy}`
          : "数据不足",
        data: summary,
        stats: { totalDays: Array.from(byCondition.values()).reduce((a, b) => a + b.length, 0) },
        chart: {
          type: "bar",
          xLabel: "天气状况",
          yLabel: "平均精力",
          data: summary.map((s) => ({ x: s.condition, y: s.avgEnergy }))
        },
        reliability: `样本量较小，各天气类型天数不均衡。`
      });
    }

    case "sleep_trend": {
      const sleeps = await prisma.sleepRecord.findMany({
        where: { userId: TEMP_USER_ID, date: { gte: since } },
        orderBy: { date: "asc" }
      });

      const trend = sleeps
        .filter((s) => s.durationMinutes)
        .map((s) => ({
          date: s.date.toISOString().slice(0, 10),
          hours: +(s.durationMinutes! / 60).toFixed(1)
        }));

      const avgSleep = trend.length > 0 ? +(trend.reduce((a, b) => a + b.hours, 0) / trend.length).toFixed(1) : 0;

      return NextResponse.json({
        title: "睡眠时长趋势",
        conclusion: trend.length > 0
          ? `近${trend.length}天平均睡眠 ${avgSleep} 小时。`
          : "数据不足",
        data: trend,
        stats: { avgSleep, sampleSize: trend.length },
        chart: {
          type: "line",
          xLabel: "日期",
          yLabel: "睡眠时长（小时）",
          data: trend.map((t) => ({ x: t.date, y: t.hours }))
        },
        reliability: `样本量：${trend.length}天。`
      });
    }

    default:
      return NextResponse.json({ error: "未知预设分析" }, { status: 400 });
  }
}

async function handleFreeAnalysis(varA: string, varB: string, since: Date, _days: number) {
  // 自由分析：提取两个变量的数据，计算相关性
  // 支持的变量：sleep_hours, coffee_ml, coffee_time, energy, focus, fatigue, morning_spirit, work_minutes, social_count

  const dataMap = new Map<string, Record<string, number>>();

  // 获取每日数据
  const dailies = await prisma.dailyRecord.findMany({
    where: { userId: TEMP_USER_ID, date: { gte: since } }
  });
  for (const d of dailies) {
    const key = d.date.toISOString().slice(0, 10);
    const entry = dataMap.get(key) || {};
    if (d.energy !== null) entry.energy = d.energy;
    if (d.focus !== null) entry.focus = d.focus;
    if (d.bodyFatigue !== null) entry.fatigue = d.bodyFatigue;
    if (d.morningSpirit !== null) entry.morning_spirit = d.morningSpirit;
    dataMap.set(key, entry);
  }

  // 睡眠
  const sleeps = await prisma.sleepRecord.findMany({
    where: { userId: TEMP_USER_ID, date: { gte: since } }
  });
  for (const s of sleeps) {
    const key = s.date.toISOString().slice(0, 10);
    const entry = dataMap.get(key) || {};
    if (s.durationMinutes) entry.sleep_hours = s.durationMinutes / 60;
    entry.sleep_start_hour = s.sleepStart.getHours();
    dataMap.set(key, entry);
  }

  // 咖啡
  const coffees = await prisma.coffeeRecord.findMany({
    where: { userId: TEMP_USER_ID, time: { gte: since } }
  });
  for (const c of coffees) {
    const key = c.time.toISOString().slice(0, 10);
    const entry = dataMap.get(key) || {};
    entry.coffee_ml = (entry.coffee_ml || 0) + c.amountMl;
    if (!entry.coffee_time || c.time.getHours() > entry.coffee_time) {
      entry.coffee_time = c.time.getHours();
    }
    dataMap.set(key, entry);
  }

  // 工作
  const works = await prisma.workRecord.findMany({
    where: { userId: TEMP_USER_ID, startTime: { gte: since } }
  });
  for (const w of works) {
    const key = w.startTime.toISOString().slice(0, 10);
    const entry = dataMap.get(key) || {};
    entry.work_minutes = (entry.work_minutes || 0) + (w.durationMinutes || 0);
    dataMap.set(key, entry);
  }

  // 社交
  const socials = await prisma.socialRecord.findMany({
    where: { userId: TEMP_USER_ID, startTime: { gte: since } }
  });
  for (const s of socials) {
    const key = s.startTime.toISOString().slice(0, 10);
    const entry = dataMap.get(key) || {};
    entry.social_count = (entry.social_count || 0) + 1;
    dataMap.set(key, entry);
  }

  // 提取配对数据
  const pairs: { date: string; a: number; b: number }[] = [];
  for (const [date, entry] of dataMap) {
    const a = entry[varA];
    const b = entry[varB];
    if (a !== undefined && b !== undefined) {
      pairs.push({ date, a, b });
    }
  }

  if (pairs.length < 3) {
    return NextResponse.json({
      title: `${varA} × ${varB}`,
      conclusion: "数据不足，无法计算相关性。请收集更多数据。",
      data: pairs,
      stats: { sampleSize: pairs.length },
      chart: { type: "scatter", data: pairs.map((p) => ({ x: p.a, y: p.b })) },
      reliability: `样本量不足（${pairs.length}天），需要至少3天数据。`
    });
  }

  const r = pearsonCorrelation(
    pairs.map((p) => p.a),
    pairs.map((p) => p.b)
  );

  return NextResponse.json({
    title: `${varA} × ${varB}`,
    conclusion: r
      ? `近${pairs.length}天数据，${varA}与${varB}${Math.abs(r) > 0.3 ? (r > 0 ? "呈正相关" : "呈负相关") : "无明显相关性"}（r = ${r.toFixed(3)}）`
      : "无法计算相关性",
    data: pairs,
    stats: { sampleSize: pairs.length, correlation: r },
    chart: {
      type: "scatter",
      xLabel: varA,
      yLabel: varB,
      data: pairs.map((p) => ({ x: +p.a.toFixed(2), y: +p.b.toFixed(2) }))
    },
    reliability: r
      ? `样本量：${pairs.length}天。${Math.abs(r) < 0.3 ? "相关性较弱。" : "存在一定相关性，但不代表因果关系。"}`
      : `样本量：${pairs.length}天。`
  });
}