import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        grade: true,
        region: true,
        points: true,
        role: true,
        createdAt: true,
      },
    });

    const questions = await prisma.question.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    const answers = await prisma.answer.findMany({
      where: { lecturerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        question: { select: { title: true } },
      },
    });

    const registrations = await prisma.projectRegistration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { title: true, status: true } },
      },
    });

    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: { select: { name: true, description: true, iconUrl: true } },
      },
    });

    return NextResponse.json({
      user,
      questions,
      answers,
      registrations,
      badges,
    });
  } catch (error) {
    console.error("获取个人资料失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
