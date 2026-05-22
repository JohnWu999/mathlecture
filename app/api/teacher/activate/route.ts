import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "无权访问" }, { status: 403 });
  }

  try {
    const { userId, activate } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: activate },
    });

    return NextResponse.json({
      message: activate ? "已开放权限" : "已关闭权限",
      user: { id: user.id, name: user.name, isActive: user.isActive },
    });
  } catch (error) {
    console.error("开放权限失败:", error);
    return NextResponse.json({ error: "操作失败" }, { status: 500 });
  }
}
