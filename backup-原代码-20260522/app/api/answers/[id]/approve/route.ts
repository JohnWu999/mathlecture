import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    // 查找回答
    const answer = await prisma.answer.findUnique({
      where: { id: params.id },
      include: { question: true },
    });

    if (!answer) {
      return NextResponse.json({ error: "回答不存在" }, { status: 404 });
    }

    // 只有提问者可以采纳
    if (answer.question.authorId !== session.user.id) {
      return NextResponse.json({ error: "只有提问者可以采纳" }, { status: 403 });
    }

    // 更新回答状态为APPROVED
    await prisma.answer.update({
      where: { id: params.id },
      data: { status: "APPROVED" },
    });

    // 更新问题状态为SOLVED
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { status: "RESOLVED" },
    });

    // 给回答者加积分
    await prisma.user.update({
      where: { id: answer.lecturerId },
      data: { points: { increment: 10 } },
    });

    return NextResponse.json({ message: "采纳成功" });
  } catch (error) {
    console.error("采纳失败:", error);
    return NextResponse.json({ error: "采纳失败" }, { status: 500 });
  }
}
