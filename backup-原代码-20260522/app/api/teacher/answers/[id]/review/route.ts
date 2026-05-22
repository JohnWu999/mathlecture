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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await checkTeacherAuth();
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { action } = await req.json(); // "approve" 或 "reject"

    if (action === "approve") {
      const answer = await prisma.answer.update({
        where: { id: params.id },
        data: { status: "APPROVED" },
      });
      // 给小讲师加积分
      await prisma.user.update({
        where: { id: answer.lecturerId },
        data: { points: { increment: 10 } },
      });
      return NextResponse.json({ message: "已通过" });
    } else {
      await prisma.answer.update({
        where: { id: params.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ message: "已拒绝" });
    }
  } catch (error) {
    console.error("审核失败:", error);
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}
