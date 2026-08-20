import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const dateParam = req.nextUrl.searchParams.get("date");
  const today = dateParam ? new Date(dateParam) : new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [sleep, coffees, socials, works, locations, contents, events, dailyRecord, dreams, weathers] =
    await Promise.all([
      prisma.sleepRecord.findFirst({
        where: { userId, date: { gte: today, lt: tomorrow } }
      }),
      prisma.coffeeRecord.findMany({
        where: { userId: userId, time: { gte: today, lt: tomorrow } },
        orderBy: { time: "asc" }
      }),
      prisma.socialRecord.findMany({
        where: { userId: userId, startTime: { gte: today, lt: tomorrow } },
        orderBy: { startTime: "asc" }
      }),
      prisma.workRecord.findMany({
        where: { userId: userId, startTime: { gte: today, lt: tomorrow } },
        orderBy: { startTime: "asc" }
      }),
      prisma.locationRecord.findMany({
        where: { userId: userId, time: { gte: today, lt: tomorrow } },
        orderBy: { time: "asc" }
      }),
      prisma.contentRecord.findMany({
        where: { userId: userId, time: { gte: today, lt: tomorrow } },
        orderBy: { time: "asc" }
      }),
      prisma.eventRecord.findMany({
        where: { userId: userId, time: { gte: today, lt: tomorrow } },
        orderBy: { time: "asc" }
      }),
      prisma.dailyRecord.findFirst({
        where: { userId: userId, date: { gte: today, lt: tomorrow } }
      }),
      prisma.dreamRecord.findFirst({
        where: { userId: userId, date: { gte: today, lt: tomorrow } }
      }),
      prisma.weatherRecord.findFirst({
        where: { userId: userId, date: { gte: today, lt: tomorrow } }
      })
    ]);

  // 构建时间线条目
  const timeline: TimelineEntry[] = [];

  if (sleep) {
    // 起床
    timeline.push({
      time: sleep.sleepEnd.toISOString(),
      type: "wake",
      icon: "🌅",
      label: "起床",
      detail: sleep.durationMinutes
        ? `睡眠 ${Math.floor(sleep.durationMinutes / 60)}小时${sleep.durationMinutes % 60}分钟`
        : undefined
    });
    // 入睡
    timeline.push({
      time: sleep.sleepStart.toISOString(),
      type: "sleep",
      icon: "😴",
      label: "入睡"
    });
  }

  for (const c of coffees) {
    timeline.push({
      time: c.time.toISOString(),
      type: "coffee",
      icon: "☕",
      label: "咖啡",
      detail: `${c.amountMl}ml`
    });
  }

  for (const w of works) {
    timeline.push({
      time: w.startTime.toISOString(),
      type: "work",
      icon: w.type === "study" ? "📖" : "💻",
      label: w.type === "study" ? "学习" : "工作",
      detail: w.durationMinutes
        ? `${Math.floor(w.durationMinutes / 60)}小时${w.durationMinutes % 60}分钟`
        : undefined
    });
  }

  for (const l of locations) {
    timeline.push({
      time: l.time.toISOString(),
      type: "location",
      icon: "📍",
      label: l.name
    });
  }

  for (const s of socials) {
    timeline.push({
      time: s.startTime.toISOString(),
      type: "social",
      icon: "👥",
      label: s.type,
      detail: s.feeling ?? undefined
    });
  }

  for (const c of contents) {
    timeline.push({
      time: c.time.toISOString(),
      type: c.type === "movie" ? "movie" : "music",
      icon: c.type === "movie" ? "🎬" : "🎵",
      label: c.title
    });
  }

  for (const e of events) {
    timeline.push({
      time: e.time.toISOString(),
      type: "event",
      icon: e.isImportant ? "⚡" : "📌",
      label: e.content,
      important: e.isImportant
    });
  }

  if (dreams) {
    timeline.push({
      time: dreams.date.toISOString(),
      type: "dream",
      icon: dreams.hadDream ? "💭" : "😶",
      label: dreams.hadDream ? "做梦了" : "没做梦"
    });
  }

  if (weathers) {
    const parts: string[] = [];
    if (weathers.temperature !== null) parts.push(`${weathers.temperature}°C`);
    if (weathers.condition) parts.push(weathers.condition);
    timeline.push({
      time: weathers.date.toISOString(),
      type: "weather",
      icon: "🌤",
      label: "天气",
      detail: parts.join(" · ")
    });
  }

  // 按时间排序
  timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return NextResponse.json({
    date: today.toISOString(),
    timeline,
    dailyRecord: dailyRecord
      ? {
          mood: dailyRecord.mood,
          energy: dailyRecord.energy,
          focus: dailyRecord.focus,
          bodyFatigue: dailyRecord.bodyFatigue,
          morningSpirit: dailyRecord.morningSpirit,
          highPoint: dailyRecord.highPoint,
          lowPoint: dailyRecord.lowPoint
        }
      : null
  });
}

type TimelineEntry = {
  time: string;
  type: string;
  icon: string;
  label: string;
  detail?: string;
  important?: boolean;
};