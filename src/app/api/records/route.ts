import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEMP_USER_ID = "default-user";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, ...data } = body;

    switch (type) {
      case "daily": {
        const record = await prisma.dailyRecord.upsert({
          where: {
            userId_date: {
              userId: TEMP_USER_ID,
              date: new Date(data.date)
            }
          },
          create: {
            userId: TEMP_USER_ID,
            date: new Date(data.date),
            mood: data.mood,
            energy: data.energy,
            focus: data.focus,
            bodyFatigue: data.bodyFatigue,
            morningSpirit: data.morningSpirit,
            highPoint: data.highPoint,
            lowPoint: data.lowPoint
          },
          update: {
            mood: data.mood,
            energy: data.energy,
            focus: data.focus,
            bodyFatigue: data.bodyFatigue,
            morningSpirit: data.morningSpirit,
            highPoint: data.highPoint,
            lowPoint: data.lowPoint
          }
        });
        return NextResponse.json(record);
      }

      case "sleep": {
        const sleepStart = new Date(data.sleepStart);
        const sleepEnd = new Date(data.sleepEnd);
        const durationMinutes = Math.round(
          (sleepEnd.getTime() - sleepStart.getTime()) / 60000
        );

        const record = await prisma.sleepRecord.create({
          data: {
            userId: TEMP_USER_ID,
            date: new Date(data.date),
            sleepStart,
            sleepEnd,
            durationMinutes
          }
        });
        return NextResponse.json(record);
      }

      case "coffee": {
        const record = await prisma.coffeeRecord.create({
          data: {
            userId: TEMP_USER_ID,
            time: new Date(data.time),
            amountMl: data.amountMl
          }
        });
        return NextResponse.json(record);
      }

      case "social": {
        const record = await prisma.socialRecord.create({
          data: {
            userId: TEMP_USER_ID,
            type: data.socialType,
            description: data.description,
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
            feeling: data.feeling
          }
        });
        return NextResponse.json(record);
      }

      case "physiology": {
        const record = await prisma.physiologyRecord.create({
          data: {
            userId: TEMP_USER_ID,
            isPeriod: data.isPeriod,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
            dayStatus: data.dayStatus,
            moodState: data.moodState,
            painLevel: data.painLevel
          }
        });
        return NextResponse.json(record);
      }

      case "dream": {
        const record = await prisma.dreamRecord.upsert({
          where: {
            userId_date: {
              userId: TEMP_USER_ID,
              date: new Date(data.date)
            }
          },
          create: {
            userId: TEMP_USER_ID,
            date: new Date(data.date),
            hadDream: data.hadDream
          },
          update: {
            hadDream: data.hadDream
          }
        });
        return NextResponse.json(record);
      }

      case "work": {
        const startTime = new Date(data.startTime);
        const endTime = new Date(data.endTime);
        const durationMinutes = Math.round(
          (endTime.getTime() - startTime.getTime()) / 60000
        );

        const record = await prisma.workRecord.create({
          data: {
            userId: TEMP_USER_ID,
            type: data.workType,
            startTime,
            endTime,
            durationMinutes
          }
        });
        return NextResponse.json(record);
      }

      case "location": {
        const record = await prisma.locationRecord.create({
          data: {
            userId: TEMP_USER_ID,
            name: data.name,
            time: new Date(data.time)
          }
        });
        return NextResponse.json(record);
      }

      case "weather": {
        const record = await prisma.weatherRecord.upsert({
          where: {
            userId_date: {
              userId: TEMP_USER_ID,
              date: new Date(data.date)
            }
          },
          create: {
            userId: TEMP_USER_ID,
            date: new Date(data.date),
            temperature: data.temperature,
            condition: data.condition,
            humidity: data.humidity,
            rainfall: data.rainfall,
            isManual: true
          },
          update: {
            temperature: data.temperature,
            condition: data.condition,
            humidity: data.humidity,
            rainfall: data.rainfall,
            isManual: true
          }
        });
        return NextResponse.json(record);
      }

      case "content": {
        const record = await prisma.contentRecord.create({
          data: {
            userId: TEMP_USER_ID,
            type: data.contentType,
            title: data.title,
            time: new Date(data.time)
          }
        });
        return NextResponse.json(record);
      }

      case "event": {
        const record = await prisma.eventRecord.create({
          data: {
            userId: TEMP_USER_ID,
            time: new Date(data.time),
            content: data.content,
            isImportant: data.isImportant
          }
        });
        return NextResponse.json(record);
      }

      default:
        return NextResponse.json({ error: "未知记录类型" }, { status: 400 });
    }
  } catch (error) {
    console.error("创建记录失败:", error);
    return NextResponse.json({ error: "创建记录失败" }, { status: 500 });
  }
}

// 删除记录
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id = searchParams.get("id");
    if (!type || !id) return NextResponse.json({ error: "缺少参数" }, { status: 400 });

    switch (type) {
      case "daily": await prisma.dailyRecord.delete({ where: { id } }); break;
      case "sleep": await prisma.sleepRecord.delete({ where: { id } }); break;
      case "coffee": await prisma.coffeeRecord.delete({ where: { id } }); break;
      case "social": await prisma.socialRecord.delete({ where: { id } }); break;
      case "physiology": await prisma.physiologyRecord.delete({ where: { id } }); break;
      case "dream": await prisma.dreamRecord.delete({ where: { id } }); break;
      case "work": await prisma.workRecord.delete({ where: { id } }); break;
      case "location": await prisma.locationRecord.delete({ where: { id } }); break;
      case "weather": await prisma.weatherRecord.delete({ where: { id } }); break;
      case "content": await prisma.contentRecord.delete({ where: { id } }); break;
      case "event": await prisma.eventRecord.delete({ where: { id } }); break;
      default: return NextResponse.json({ error: "未知记录类型" }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("删除记录失败:", error);
    return NextResponse.json({ error: "删除记录失败" }, { status: 500 });
  }
}