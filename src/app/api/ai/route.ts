import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "sk-placeholder"
});

// ─── 工具定义 ────────────────────────────────────────

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "get_daily_records",
      description: "获取用户的每日状态记录，包含情绪、精力、专注力、身体疲劳、起床精神程度等数据",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "查询最近多少天，默认30" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_sleep_records",
      description: "获取用户的睡眠记录，包含入睡时间、起床时间、睡眠时长",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "查询最近多少天，默认30" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_coffee_records",
      description: "获取用户的咖啡记录，包含喝咖啡时间和摄入量",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "查询最近多少天，默认30" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_social_records",
      description: "获取用户的社交记录，包含社交类型、描述、感受",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "查询最近多少天，默认30" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "get_work_records",
      description: "获取用户的工作/学习记录，包含类型、时长",
      parameters: {
        type: "object",
        properties: {
          days: { type: "number", description: "查询最近多少天，默认30" }
        }
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_average",
      description: "计算一组数值的平均值",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string", description: "指标名称" },
          values: { type: "array", items: { type: "number" }, description: "数值数组" }
        },
        required: ["label", "values"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_distribution",
      description: "计算一组数值的分布统计",
      parameters: {
        type: "object",
        properties: {
          label: { type: "string", description: "指标名称" },
          values: { type: "array", items: { type: "number" }, description: "数值数组" },
          bins: { type: "number", description: "分组数量，默认5" }
        },
        required: ["label", "values"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "calculate_correlation",
      description: "计算两个变量之间的Pearson相关系数",
      parameters: {
        type: "object",
        properties: {
          labelA: { type: "string", description: "变量A名称" },
          labelB: { type: "string", description: "变量B名称" },
          valuesA: { type: "array", items: { type: "number" }, description: "变量A数值" },
          valuesB: { type: "array", items: { type: "number" }, description: "变量B数值" }
        },
        required: ["labelA", "labelB", "valuesA", "valuesB"]
      }
    }
  },
  {
    type: "function" as const,
    function: {
      name: "compare_groups",
      description: "按分组变量比较另一个变量的均值",
      parameters: {
        type: "object",
        properties: {
          groupLabel: { type: "string", description: "分组变量名" },
          valueLabel: { type: "string", description: "比较变量名" },
          groups: { type: "array", items: { type: "string" }, description: "分组名称" },
          values: { type: "array", items: { type: "number" }, description: "对应数值" }
        },
        required: ["groupLabel", "valueLabel", "groups", "values"]
      }
    }
  }
];

// ─── 工具执行 ────────────────────────────────────────

async function executeTool(userId: string, name: string, args: Record<string, unknown>) {
  const days = (args.days as number) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  switch (name) {
    case "get_daily_records": {
      const records = await prisma.dailyRecord.findMany({
        where: { userId: userId, date: { gte: since } },
        orderBy: { date: "desc" }
      });
      return records.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        mood: r.mood,
        energy: r.energy,
        focus: r.focus,
        bodyFatigue: r.bodyFatigue,
        morningSpirit: r.morningSpirit
      }));
    }

    case "get_sleep_records": {
      const records = await prisma.sleepRecord.findMany({
        where: { userId: userId, date: { gte: since } },
        orderBy: { date: "desc" }
      });
      return records.map((r) => ({
        date: r.date.toISOString().slice(0, 10),
        sleepStart: r.sleepStart.toISOString(),
        sleepEnd: r.sleepEnd.toISOString(),
        durationMinutes: r.durationMinutes,
        durationHours: r.durationMinutes ? +(r.durationMinutes / 60).toFixed(1) : null
      }));
    }

    case "get_coffee_records": {
      const records = await prisma.coffeeRecord.findMany({
        where: { userId: userId, time: { gte: since } },
        orderBy: { time: "desc" }
      });
      return records.map((r) => ({
        time: r.time.toISOString(),
        amountMl: r.amountMl
      }));
    }

    case "get_social_records": {
      const records = await prisma.socialRecord.findMany({
        where: { userId: userId, startTime: { gte: since } },
        orderBy: { startTime: "desc" }
      });
      return records.map((r) => ({
        type: r.type,
        description: r.description,
        startTime: r.startTime.toISOString(),
        endTime: r.endTime.toISOString(),
        feeling: r.feeling
      }));
    }

    case "get_work_records": {
      const records = await prisma.workRecord.findMany({
        where: { userId: userId, startTime: { gte: since } },
        orderBy: { startTime: "desc" }
      });
      return records.map((r) => ({
        type: r.type,
        startTime: r.startTime.toISOString(),
        endTime: r.endTime.toISOString(),
        durationMinutes: r.durationMinutes
      }));
    }

    case "calculate_average": {
      const values = args.values as number[];
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      return {
        label: args.label,
        count: values.length,
        average: +avg.toFixed(2),
        min: Math.min(...values),
        max: Math.max(...values)
      };
    }

    case "calculate_distribution": {
      const values = args.values as number[];
      const bins = (args.bins as number) || 5;
      const min = Math.min(...values);
      const max = Math.max(...values);
      const step = (max - min) / bins || 1;
      const dist: { range: string; count: number }[] = [];
      for (let i = 0; i < bins; i++) {
        const lo = min + i * step;
        const hi = lo + step;
        dist.push({
          range: `${lo.toFixed(1)}–${hi.toFixed(1)}`,
          count: values.filter((v) => v >= lo && (i === bins - 1 ? v <= hi : v < hi)).length
        });
      }
      return { label: args.label, distribution: dist };
    }

    case "calculate_correlation": {
      const xs = args.valuesA as number[];
      const ys = args.valuesB as number[];
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
      const r = denX * denY === 0 ? null : +(num / Math.sqrt(denX * denY)).toFixed(3);
      return {
        labelA: args.labelA,
        labelB: args.labelB,
        sampleSize: n,
        correlation: r,
        interpretation: r
          ? Math.abs(r) < 0.3 ? "相关性较弱" : Math.abs(r) < 0.6 ? "中等相关" : "较强相关"
          : "无法计算"
      };
    }

    case "compare_groups": {
      const groups = args.groups as string[];
      const values = args.values as number[];
      const map = new Map<string, number[]>();
      for (let i = 0; i < groups.length; i++) {
        if (!map.has(groups[i])) map.set(groups[i], []);
        map.get(groups[i])!.push(values[i]);
      }
      const result: { group: string; avg: number; count: number }[] = [];
      for (const [group, vals] of map) {
        result.push({
          group,
          avg: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2),
          count: vals.length
        });
      }
      return { groupLabel: args.groupLabel, valueLabel: args.valueLabel, groups: result };
    }

    default:
      return { error: "未知工具" };
  }
}

// ─── API 路由 ────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

    const { message, conversationId } = await req.json();
    if (!message) return NextResponse.json({ error: "缺少消息" }, { status: 400 });

    // 获取或创建对话
    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aiConversation.create({
        data: { userId: userId }
      });
      convId = conv.id;
    }

    // 保存用户消息
    await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: "user",
        content: message
      }
    });

    // 获取历史消息
    const history = await prisma.aiMessage.findMany({
      where: { conversationId: convId },
      orderBy: { createdAt: "asc" }
    });

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `你是 Life Lab 的数据助手，帮助用户分析他们的个人生活数据。

你的角色：
1. 数据分析师：查询数据、统计、聚合、对比、趋势、相关性
2. 研究助手：提出假设、寻找可能变量、识别混杂因素

重要规则：
- 你必须基于真实数据库数据进行分析，不能凭空生成数据
- 统计计算由工具函数完成，你负责解释结果
- 必须明确区分：数据事实、相关性、推测、因果关系、数据不足
- 数据不足时必须告诉用户，不能强行得出结论
- 使用中文回答，语气温暖、理性、简洁
- 不要给出医疗建议`
      },
      ...history.map((m) => {
        if (m.role === "user") {
          return { role: "user" as const, content: m.content };
        }
        if (m.role === "assistant") {
          return { role: "assistant" as const, content: m.content || "" };
        }
        // tool message
        return {
          role: "tool" as const,
          tool_call_id: m.toolCalls || "",
          content: m.content
        };
      })
    ];

    // 如果没有 API Key，返回 mock 响应
    if (!process.env.OPENAI_API_KEY) {
      const mockReply = `⚠️ 尚未配置 OpenAI API Key。\n\n请在 .env 文件中设置 OPENAI_API_KEY 以启用 AI 数据对话功能。\n\n你的数据已经存储在数据库中，配置完成后即可使用 AI 分析。`;
      await prisma.aiMessage.create({
        data: { conversationId: convId, role: "assistant", content: mockReply }
      });
      return NextResponse.json({ conversationId: convId, reply: mockReply, mock: true });
    }

    // 调用 OpenAI（带工具调用循环，最多 3 轮）
    let currentMessages = messages;
    let finalReply = "";
    const maxRounds = 3;

    for (let round = 0; round < maxRounds; round++) {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: currentMessages,
        tools: TOOLS,
        tool_choice: "auto"
      });

      const assistantMessage = response.choices[0].message;

      // 无工具调用，保存并返回
      if (!assistantMessage.tool_calls) {
        finalReply = assistantMessage.content || "无法生成回复";
        await prisma.aiMessage.create({
          data: { conversationId: convId, role: "assistant", content: finalReply }
        });
        return NextResponse.json({ conversationId: convId, reply: finalReply });
      }

      // 保存 AI 的工具调用
      await prisma.aiMessage.create({
        data: {
          conversationId: convId,
          role: "assistant",
          content: assistantMessage.content || "",
          toolCalls: JSON.stringify(assistantMessage.tool_calls)
        }
      });

      // 执行工具并收集结果
      const toolResults: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
      for (const tc of assistantMessage.tool_calls) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const fn = (tc as any).function;
        const args = JSON.parse(fn.arguments);
        const result = await executeTool(userId, fn.name, args);
        const resultStr = JSON.stringify(result);

        await prisma.aiMessage.create({
          data: {
            conversationId: convId,
            role: "tool",
            content: resultStr,
            toolCalls: tc.id
          }
        });

        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: resultStr
        });
      }

      // 准备下一轮消息
      currentMessages = [
        ...currentMessages,
        assistantMessage,
        ...toolResults
      ];
    }

    // 最后一轮获取最终回复
    const finalResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: currentMessages
    });

    finalReply = finalResponse.choices[0].message.content || "无法生成回复";
    await prisma.aiMessage.create({
      data: { conversationId: convId, role: "assistant", content: finalReply }
    });

    return NextResponse.json({ conversationId: convId, reply: finalReply });
  } catch (error) {
    console.error("AI 对话错误:", error);
    return NextResponse.json({ error: "AI 服务暂时不可用" }, { status: 500 });
  }
}

// 获取对话列表
export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const messages = await prisma.aiMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" }
    });
    return NextResponse.json(messages);
  }

  const conversations = await prisma.aiConversation.findMany({
    where: { userId: userId },
    orderBy: { updatedAt: "desc" },
    take: 20
  });
  return NextResponse.json(conversations);
}