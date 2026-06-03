import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createQuestionApprovalGrowthEnergy } from "@/lib/qa-flow-rules.mjs";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401, session: null };
  if (session.user.role !== "TEACHER") {
    return { error: "无权访问", status: 403, session };
  }
  return { error: null, status: 200, session };
}

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await checkTeacherAuth();
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { action, reviewNote } = await req.json(); // "approve" 或 "reject"

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      select: { id: true, authorId: true, reviewStatus: true },
    });

    if (!question) {
      return NextResponse.json({ error: "问题不存在" }, { status: 404 });
    }

    if (action === "approve") {
      const growthEnergy = createQuestionApprovalGrowthEnergy({
        questionId: question.id,
        userId: question.authorId,
      });

      const result = await prisma.$transaction(async (tx) => {
        const updatedQuestion = await tx.question.update({
          where: { id: params.id },
          data: { reviewStatus: "APPROVED", status: "OPEN" },
        });

        if (question.reviewStatus !== "APPROVED") {
          await tx.user.update({
            where: { id: question.authorId },
            data: {
              growthEnergy: { increment: growthEnergy.amount },
              points: { increment: growthEnergy.amount },
            },
          });
          await tx.pointTransaction.create({
            data: {
              userId: growthEnergy.userId,
              amount: growthEnergy.amount,
              reason: growthEnergy.reason,
              displayLabel: growthEnergy.displayLabel,
              userMessage: growthEnergy.userMessage,
              sourceType: growthEnergy.sourceType,
              sourceId: growthEnergy.sourceId,
              visibility: growthEnergy.visibility,
              affectsIdentityLevel: growthEnergy.affectsIdentityLevel,
            },
          });
        }

        return updatedQuestion;
      });

      return NextResponse.json({
        message: "问题已通过审核",
        question: result,
        growthEnergy: {
          amount: growthEnergy.amount,
          displayLabel: growthEnergy.displayLabel,
          userMessage: growthEnergy.userMessage,
          rankingEnabled: growthEnergy.rankingEnabled,
        },
      });
    }

    await prisma.question.update({
      where: { id: params.id },
      data: {
        reviewStatus: "REJECTED",
        status: "OPEN",
      },
    });

    return NextResponse.json({
      message: "问题已退回修改",
      reviewNote: reviewNote || "这个问题还需要补充一点信息，改好后我们再一起看。",
    });
  } catch (error) {
    console.error("审核问题失败:", error);
    return NextResponse.json({ error: "审核问题失败" }, { status: 500 });
  }
}
