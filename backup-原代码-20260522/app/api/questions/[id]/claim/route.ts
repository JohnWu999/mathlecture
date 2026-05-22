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
    const question = await prisma.question.findUnique({
      where: { id: params.id },
    });

    if (!question) {
      return NextResponse.json({ error: "问题不存在" }, { status: 404 });
    }

    if (question.status !== "OPEN") {
      return NextResponse.json({ error: "该问题已被认领" }, { status: 400 });
    }

    // 创建一个空的回答来"认领"问题
    await prisma.answer.create({
      data: {
        videoUrl: "", // 暂时为空，等待小讲师录制视频
        questionId: params.id,
        lecturerId: session.user.id,
        status: "PENDING",
      },
    });

    // 更新问题状态
    await prisma.question.update({
      where: { id: params.id },
      data: { status: "CLAIMED" },
    });

    return NextResponse.json({ message: "认领成功" });
  } catch (error) {
    console.error("认领失败:", error);
    return NextResponse.json({ error: "认领失败" }, { status: 500 });
  }
}
