import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";


// GET: 获取小组消息
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const messages = await prisma.message.findMany({
      where: { groupId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { name: true } },
      },
      take: 100,
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.error("获取消息失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// POST: 发送消息
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "消息内容不能为空" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        groupId: params.id,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("发送消息失败:", error);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
