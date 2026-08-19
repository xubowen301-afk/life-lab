import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TEMP_USER_ID = "default-user";

export async function GET() {
  const experiments = await prisma.experiment.findMany({
    where: { userId: TEMP_USER_ID },
    orderBy: { createdAt: "desc" },
    include: { observations: { orderBy: { date: "desc" }, take: 5 } }
  });
  return NextResponse.json(experiments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const experiment = await prisma.experiment.create({
    data: {
      userId: TEMP_USER_ID,
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