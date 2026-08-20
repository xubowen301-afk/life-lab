import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");

  const where: Record<string, unknown> = { userId: userId };
  if (category) where.category = category;
  if (query) where.name = { contains: query, mode: "insensitive" };

  const items = await prisma.preference.findMany({
    where,
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const body = await req.json();
  const record = await prisma.preference.create({
    data: {
      userId: userId,
      category: body.category,
      name: body.name,
      note: body.note
    }
  });
  return NextResponse.json(record);
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "请先登录" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "缺少 id" }, { status: 400 });

  await prisma.preference.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}