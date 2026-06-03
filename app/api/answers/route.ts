import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const ALLOWED_SHARE_SCOPES = new Set(["QUESTION_AUTHOR_ONLY", "PUBLIC_HALL", "GROUP_ONLY"]);

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { videoUrl, description, questionId, shareScope } = await req.json();
    if (!String(videoUrl || '').trim()) {
      return NextResponse.json({ error: "请先上传讲题视频" }, { status: 400 });
    }

    // 检查问题是否被当前用户认领，且仍在 72 小时有效期内
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        status: true,
        claimedById: true,
        claimExpiresAt: true,
        shareScope: true,
      },
    });

    if (!question || question.claimedById !== session.user.id) {
      return NextResponse.json(
        { error: "你没有认领该问题或已提交过回答" },
        { status: 403 }
      );
    }

    if (question.claimExpiresAt && question.claimExpiresAt.getTime() <= Date.now()) {
      await prisma.question.update({
        where: { id: questionId },
        data: {
          status: "OPEN",
          claimedById: null,
          claimedAt: null,
          claimExpiresAt: null,
          releasedAt: new Date(),
        },
      });
      return NextResponse.json(
        { error: "认领已超过72小时，这道题已重新开放认领" },
        { status: 400 }
      );
    }

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

    const finalShareScope = ALLOWED_SHARE_SCOPES.has(shareScope)
      ? shareScope
      : question.shareScope;

    const answer = await prisma.answer.update({
      where: { id: existingAnswer.id },
      data: {
        videoUrl,
        description,
        shareScope: finalShareScope,
        reviewStatus: "PENDING",
        status: "PENDING", // 提交后等待老师审核
      },
    });

    await prisma.question.update({
      where: { id: questionId },
      data: { status: "ANSWERED" },
    });

    return NextResponse.json(
      {
        answer,
        childMessage: "讲解已经收到。老师看过后，才会分享给出题人或进入成果广场。",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("提交回答失败:", error);
    return NextResponse.json({ error: "提交回答失败" }, { status: 500 });
  }
}
