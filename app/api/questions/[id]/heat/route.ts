import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createQuestionHeatDecision } from "@/lib/qa-flow-rules.mjs";

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
      select: { id: true, reviewStatus: true },
    });

    if (!question) {
      return NextResponse.json({ error: "问题不存在" }, { status: 404 });
    }
    if (question.reviewStatus !== "APPROVED") {
      return NextResponse.json({ error: "问题还在老师审核中，暂时不能加热度" }, { status: 400 });
    }

    const existing = await prisma.questionHeat.findUnique({
      where: {
        questionId_userId: {
          questionId: params.id,
          userId: session.user.id,
        },
      },
    });

    const decision = createQuestionHeatDecision({ alreadyHeated: Boolean(existing) });

    if (decision.shouldCreate) {
      await prisma.$transaction([
        prisma.questionHeat.create({
          data: {
            questionId: params.id,
            userId: session.user.id,
          },
        }),
        prisma.question.update({
          where: { id: params.id },
          data: { heatCount: { increment: decision.heatIncrement } },
        }),
      ]);
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: { id: params.id },
      select: { id: true, heatCount: true },
    });

    return NextResponse.json({
      heatCount: updatedQuestion?.heatCount ?? 0,
      childMessage: decision.childMessage,
      rankingEnabled: decision.rankingEnabled,
      sortingOnly: decision.sortingOnly,
    });
  } catch (error) {
    console.error("加热度失败:", error);
    return NextResponse.json({ error: "加热度失败" }, { status: 500 });
  }
}
