import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { videoUrl, description, questionId } = await req.json();

    // 检查问题是否被当前用户认领
    const existingAnswer = await prisma.answer.findFirst({
      where: {
        questionId,
        lecturerId: session.user.id,
        status: "PENDING",
      },
    });

    if (!existingAnswer) {
      return NextResponse.json(
        { error: "你没有认领该问题或已提交过回答" },
        { status: 403 }
      );
    }

    // 更新回答
    const answer = await prisma.answer.update({
      where: { id: existingAnswer.id },
      data: {
        videoUrl,
        description,
        status: "PENDING", // 提交后等待审核
      },
    });

    return NextResponse.json(answer, { status: 200 });
  } catch (error) {
    console.error("提交回答失败:", error);
    return NextResponse.json({ error: "提交回答失败" }, { status: 500 });
  }
}
