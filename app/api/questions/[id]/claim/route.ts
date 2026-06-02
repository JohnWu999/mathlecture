import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getClaimWindow } from "@/lib/qa-flow-rules.mjs";

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

    if (question.reviewStatus !== "APPROVED") {
      return NextResponse.json({ error: "问题还在老师审核中，暂时不能认领" }, { status: 400 });
    }

    const now = new Date();
    const isExpiredClaim =
      question.status === "CLAIMED" &&
      question.claimExpiresAt &&
      question.claimExpiresAt.getTime() <= now.getTime();

    if (question.status !== "OPEN" && !isExpiredClaim) {
      return NextResponse.json({ error: "该问题已被认领" }, { status: 400 });
    }

    const claim = getClaimWindow({ now, lecturerId: session.user.id });

    const result = await prisma.$transaction(async (tx) => {
      if (isExpiredClaim) {
        await tx.question.update({
          where: { id: params.id },
          data: {
            status: "OPEN",
            claimedById: null,
            claimedAt: null,
            claimExpiresAt: null,
            releasedAt: now,
          },
        });
      }

      const existingPendingAnswer = await tx.answer.findFirst({
        where: {
          questionId: params.id,
          lecturerId: session.user.id,
          status: "PENDING",
        },
      });

      const answer = existingPendingAnswer ||
        (await tx.answer.create({
          data: {
            videoUrl: "",
            questionId: params.id,
            lecturerId: session.user.id,
            status: "PENDING",
            reviewStatus: "PENDING",
            shareScope: question.shareScope,
          },
        }));

      const updatedQuestion = await tx.question.update({
        where: { id: params.id },
        data: {
          status: claim.status,
          claimedById: claim.claimedById,
          claimedAt: claim.claimedAt,
          claimExpiresAt: claim.claimExpiresAt,
          releasedAt: null,
        },
      });

      return { answer, question: updatedQuestion };
    });

    return NextResponse.json({
      message: "认领成功",
      question: result.question,
      answer: result.answer,
      claimWindow: {
        claimedAt: claim.claimedAt,
        claimExpiresAt: claim.claimExpiresAt,
        hoursToExplain: claim.hoursToExplain,
      },
      childMessage: claim.childMessage,
    });
  } catch (error) {
    console.error("认领失败:", error);
    return NextResponse.json({ error: "认领失败" }, { status: 500 });
  }
}
