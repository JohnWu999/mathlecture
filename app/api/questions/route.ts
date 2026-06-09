import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeQuestionDraft } from "@/lib/qa-flow-rules.mjs";

export const dynamic = "force-dynamic";

function canReviewQuestions(session: any) {
  return session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";
}

// 获取问题列表：默认只展示审核通过的问题，未审核内容不进入公开列表
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "OPEN";
  const grade = searchParams.get("grade");
  const reviewStatusParam = searchParams.get("reviewStatus");

  const where: any = { status };
  if (grade) where.grade = parseInt(grade);

  if (canReviewQuestions(session) && reviewStatusParam) {
    where.reviewStatus = reviewStatusParam;
  } else {
    where.reviewStatus = "APPROVED";
  }

  const questions = await prisma.question.findMany({
    where,
    orderBy: [{ heatCount: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, region: true } },
      answers: {
        where: { status: "APPROVED", reviewStatus: "APPROVED" },
        select: { id: true, status: true, reviewStatus: true, shareScope: true },
      },
      claimedBy: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json({
    questions,
    listRule: "热度只帮助待讲题目排序，不是点赞榜，也不显示排名。",
  });
}

// 创建问题：题目照片/识别文字/系统建议标题/困惑类型/分享范围进入待审核状态
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const draft = normalizeQuestionDraft(body);

    const question = await prisma.question.create({
      data: {
        title: draft.title,
        suggestedTitle: draft.suggestedTitle,
        content: draft.content,
        recognizedText: draft.recognizedText,
        imageUrl: draft.imageUrl,
        isAnonymous: draft.isAnonymous,
        grade: draft.grade,
        topic: draft.topic,
        confusionType: draft.confusionType,
        shareScope: draft.shareScope,
        reviewStatus: draft.reviewStatus,
        status: draft.status,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(
      {
        question,
        growthPrompt: draft.childMessage,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("创建问题失败:", error);
    return NextResponse.json({ error: "创建问题失败" }, { status: 500 });
  }
}
