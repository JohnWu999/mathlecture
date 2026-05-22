import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    // 检查项目是否存在且已发布
    const project = await prisma.project.findUnique({
      where: { id: params.id },
    });
    if (!project || project.status !== "PUBLISHED") {
      return NextResponse.json({ error: "项目不存在或未开放报名" }, { status: 404 });
    }

    // 检查是否已报名
    const existing = await prisma.projectRegistration.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: params.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "你已经报名过该项目" }, { status: 409 });
    }

    // 创建报名记录
    const registration = await prisma.projectRegistration.create({
      data: {
        userId: session.user.id,
        projectId: params.id,
        status: "CONFIRMED", // MVP阶段跳过支付，直接确认
      },
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    console.error("报名失败:", error);
    return NextResponse.json({ error: "报名失败" }, { status: 500 });
  }
}
