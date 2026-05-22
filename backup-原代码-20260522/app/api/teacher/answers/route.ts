import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401 };
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return { error: "无权访问", status: 403 };
  }
  return null;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await checkTeacherAuth();
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const answers = await prisma.answer.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: {
        lecturer: { select: { name: true, grade: true } },
        question: { select: { title: true, content: true } },
      },
    });
    return NextResponse.json(answers);
  } catch (error) {
    console.error("获取待审核列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
