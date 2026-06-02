import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

function canReviewQuestions(session: any) {
  return session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";
}

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true } },
        claimedBy: { select: { id: true, name: true } },
        answers: {
          where: canReviewQuestions(session)
            ? undefined
            : { reviewStatus: "APPROVED" },
          include: {
            lecturer: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "问题不存在" }, { status: 404 });
    }

    const isOwner = session?.user?.id === question.authorId;
    if (question.reviewStatus !== "APPROVED" && !isOwner && !canReviewQuestions(session)) {
      return NextResponse.json({ error: "问题还在老师审核中" }, { status: 403 });
    }

    return NextResponse.json({
      question,
      sharingRule: "只有审核通过且获得授权的内容，才会进入成果广场。",
    });
  } catch (error) {
    console.error("获取问题详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
