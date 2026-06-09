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

    if (answer.reviewStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "讲解还在老师审核中，老师审核通过后才能采纳" },
        { status: 409 }
      );
    }

    // 更新回答状态为APPROVED，并保持业务状态与审核状态一致
    await prisma.answer.update({
      where: { id: params.id },
      data: { status: "APPROVED", reviewStatus: "APPROVED" },
    });

    // 更新问题状态为SOLVED
    await prisma.question.update({
      where: { id: answer.questionId },
      data: { status: "RESOLVED" },
    });

    // 给回答者记录私密“讲解成长能量”，不直接兑换身份星级
    await prisma.$transaction([
      prisma.user.update({
        where: { id: answer.lecturerId },
        data: { growthEnergy: { increment: 10 }, points: { increment: 10 } },
      }),
      prisma.pointTransaction.create({
        data: {
          userId: answer.lecturerId,
          amount: 10,
          reason: "ANSWER_APPROVED",
          displayLabel: "讲解成长能量",
          userMessage: "你努力把一道题讲清楚了。讲给别人听，也是让自己的思考长高。",
          sourceType: "ANSWER",
          sourceId: answer.id,
          visibility: "PRIVATE",
          affectsIdentityLevel: false,
        },
      }),
    ]);

    return NextResponse.json({
      message: "采纳成功",
      growthEnergy: {
        amount: 10,
        displayLabel: "讲解成长能量",
        userMessage: "你努力把一道题讲清楚了。讲给别人听，也是让自己的思考长高。",
      },
    });
  } catch (error) {
    console.error("采纳失败:", error);
    return NextResponse.json({ error: "采纳失败" }, { status: 500 });
  }
}

