import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const answer = await prisma.answer.findFirst({
      where: {
        id: params.id,
        status: "APPROVED",
        reviewStatus: "APPROVED",
        shareScope: "PUBLIC_HALL",
      },
      include: {
        lecturer: { select: { name: true, grade: true } },
        question: {
          select: {
            id: true,
            title: true,
            suggestedTitle: true,
            content: true,
            recognizedText: true,
            grade: true,
            topic: true,
            confusionType: true,
          },
        },
      },
    });

    if (answer) {
      return NextResponse.json({
        outcome: {
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
          question: {
            id: answer.question.id,
            title: answer.question.title,
            content: answer.question.content,
            recognizedText: answer.question.recognizedText,
            confusionType: answer.question.confusionType,
          },
        },
        rankingEnabled: false,
        authorizationRule: "只有老师审核通过，并获得孩子/家长授权公开的内容，才会进入成果广场。公开授权撤回后，会从成果广场下架。",
      });
    }

    const projectArtifact = await prisma.projectArtifact.findFirst({
      where: {
        id: params.id,
        reviewStatus: "APPROVED",
        shareScope: "PUBLIC_HALL",
      },
      include: {
        author: { select: { name: true, grade: true } },
        project: { select: { id: true, title: true, knowledgeTags: true } },
        group: { select: { name: true } },
      },
    });

    if (!projectArtifact) {
      return NextResponse.json({ error: "成果不存在，或尚未获得公开授权" }, { status: 404 });
    }

    return NextResponse.json({
      outcome: {
        id: projectArtifact.id,
        type: "PROJECT",
        title: projectArtifact.title || projectArtifact.project.title,
        childName: projectArtifact.group?.name || projectArtifact.author?.name || "项目小组",
        grade: projectArtifact.author?.grade,
        knowledgePoint: projectArtifact.project.knowledgeTags?.join("、") || "项目探索",
        childExpression: projectArtifact.description || "小组把观察、计算、合作和作品一起留下来。",
        teacherNote: projectArtifact.teacherNote || "这份项目作品已经由老师审核，适合分享给更多同学作为启发。",
        reviewStatus: projectArtifact.reviewStatus,
        shareScope: projectArtifact.shareScope,
        videoUrl: projectArtifact.artifactUrl || "",
        createdAt: projectArtifact.createdAt,
        project: {
          id: projectArtifact.project.id,
          title: projectArtifact.project.title,
          groupName: projectArtifact.group?.name,
        },
      },
      rankingEnabled: false,
      authorizationRule: "只有老师审核通过，并获得孩子/家长授权公开的内容，才会进入成果广场。公开授权撤回后，会从成果广场下架。",
    });
  } catch (error) {
    console.error("获取成果详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
