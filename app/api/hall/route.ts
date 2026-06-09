import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canEnterOutcomeHall } from "@/lib/review-authorization-rules.mjs";
import { getOutcomeHallEmptyState } from "@/lib/outcome-hall-ui-rules.mjs";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [publicAnswers, publicProjectArtifacts] = await Promise.all([
      prisma.answer.findMany({
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
              topic: true,
              suggestedTitle: true,
              shareScope: true,
              reviewStatus: true,
            },
          },
        },
      }),
      prisma.projectArtifact.findMany({
        where: {
          reviewStatus: "APPROVED",
          shareScope: "PUBLIC_HALL",
        },
        orderBy: { createdAt: "desc" },
        take: 24,
        include: {
          author: { select: { name: true, grade: true } },
          project: { select: { id: true, title: true, knowledgeTags: true } },
          group: { select: { name: true } },
        },
      }),
    ]);

    const answerOutcomes = publicAnswers
      .filter((answer) => canEnterOutcomeHall({ reviewStatus: answer.reviewStatus, shareScope: answer.shareScope }))
      .map((answer) => ({
        id: answer.id,
        type: "LECTURE",
        title: answer.question.suggestedTitle || answer.question.title,
        childName: answer.lecturer.name || "小讲师",
        grade: answer.lecturer.grade || answer.question.grade,
        knowledgePoint: answer.question.topic,
        childExpression: answer.description || "孩子用自己的方法，把这道题讲给更多同学听。",
        teacherNote: answer.mathTip || "这份讲解已经由老师审核，适合分享给更多同学作为启发。",
        reviewStatus: answer.reviewStatus || answer.status,
        shareScope: answer.shareScope,
        videoUrl: answer.videoUrl,
        createdAt: answer.createdAt,
        source: {
          questionId: answer.question.id,
          sourceType: "ANSWER",
        },
      }));

    const projectOutcomes = publicProjectArtifacts
      .filter((artifact) => canEnterOutcomeHall({ reviewStatus: artifact.reviewStatus, shareScope: artifact.shareScope }))
      .map((artifact) => ({
        id: artifact.id,
        type: "PROJECT",
        title: artifact.title || artifact.project.title,
        childName: artifact.group?.name || artifact.author?.name || "项目小组",
        grade: artifact.author?.grade,
        knowledgePoint: artifact.project.knowledgeTags?.join("、") || "项目探索",
        childExpression: artifact.description || "小组把观察、计算、合作和作品一起留下来。",
        teacherNote: artifact.teacherNote || "这份项目作品已经由老师审核，适合分享给更多同学作为启发。",
        reviewStatus: artifact.reviewStatus,
        shareScope: artifact.shareScope,
        videoUrl: artifact.artifactUrl || "",
        createdAt: artifact.createdAt,
        source: {
          projectId: artifact.project.id,
          groupName: artifact.group?.name,
          sourceType: "PROJECT_ARTIFACT",
        },
      }));

    const outcomes = [...answerOutcomes, ...projectOutcomes]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 36);

    return NextResponse.json({
      outcomes,
      emptyState: getOutcomeHallEmptyState({ totalPublicOutcomes: outcomes.length }),
      authorizationRule: "只有老师审核通过，并获得孩子/家长授权公开的内容，才会进入成果广场。公开授权撤回后，作品会从成果广场下架，但学习记录仍保留。",
      rankingEnabled: false,
    });
  } catch (error) {
    console.error("获取成果广场失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
