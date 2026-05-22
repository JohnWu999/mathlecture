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
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        grade: true,
        region: true,
        points: true,
        isActive: true,
        createdAt: true,
      },
      take: 100,
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
