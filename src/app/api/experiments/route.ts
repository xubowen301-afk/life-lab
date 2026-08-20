import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const experiments = await prisma.experiment.findMany({
    where: { userId: userId },
    orderBy: { createdAt: "desc" },
    include: { observations: { orderBy: { date: "desc" }, take: 5 } }
  });
  return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = await req.json();
  const experiment = await prisma.experiment.create({
    data: {
      userId: userId,
      question: body.question,
      variables: JSON.stringify(body.variables),
      metrics: JSON.stringify(body.metrics),
      period: body.period,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      status: "active"
    }
  });
  return NextResponse.json(experiment);
}

export async function PATCH(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = await req.json();
  const experiment = await prisma.experiment.update({
    where: { id: body.id },
    data: {
      status: body.status,
      conclusion: body.conclusion,
      endDate: body.endDate ? new Date(body.endDate) : undefined
    }
  });
  return NextResponse.json(experiment);
}