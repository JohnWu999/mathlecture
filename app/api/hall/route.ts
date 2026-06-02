import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicAnswers = await prisma.answer.findMany({
      where: {
        status: "APPROVED",
        reviewStatus: "APPROVED",
        shareScope: "PUBLIC_HALL",
      },
      orderBy: { createdAt: "desc" },
      take: 24,
      include: {
        lecturer: { select: { name: true, grade: true } },
        question: {
          select: {
            id: true,
            title: true,
            grade: true,
            knowledgePoint: true,
            suggestedTitle: true,
            shareScope: true,
            reviewStatus: true,
          },
        },
      },
    });

    const outcomes = publicAnswers.map((answer) => ({
      id: answer.id,
      type: "LECTURE",
      title: answer.question.suggestedTitle || answer.question.title,
      childName: answer.lecturer.name || "小讲师",
      grade: answer.lecturer.grade || answer.question.grade,
      knowledgePoint: answer.question.knowledgePoint,
      childExpression: answer.description || "孩子用自己的方法，把这道题讲给更多同学听。",
      teacherNote: "这份讲解已经由老师审核，适合分享给更多同学作为启发。",
      reviewStatus: answer.reviewStatus || answer.status,
      shareScope: answer.shareScope,
      videoUrl: answer.videoUrl,
      createdAt: answer.createdAt,
      source: {
        questionId: answer.question.id,
      },
    }));

    return NextResponse.json({
      outcomes,
      authorizationRule: "只有老师审核通过，并获得孩子/家长授权公开的内容，才会进入成果广场。",
      rankingEnabled: false,
    });
  } catch (error) {
    console.error("获取成果广场失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
