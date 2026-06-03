import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  buildShareAssetAuthorizationUpdate,
  normalizeOutcomeReviewInput,
} from "@/lib/review-authorization-rules.mjs";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401 } as const;
  if (session.user.role !== "TEACHER") {
    return { error: "无权访问", status: 403 } as const;
  }
  return { session } as const;
}

export const dynamic = "force-dynamic";

async function syncAnswerShareAsset(answer: any, reviewStatus: string, shareScope: string, teacherNote: string) {
  const update = buildShareAssetAuthorizationUpdate({ reviewStatus, shareScope, teacherNote });
  const existing = await prisma.shareAsset.findFirst({ where: { answerId: answer.id } });
  const data = {
    assetType: "ANSWER_POSTER" as const,
    userId: answer.lecturerId,
    questionId: answer.questionId,
    answerId: answer.id,
    url: answer.videoUrl,
    payload: JSON.stringify({ title: answer.question?.suggestedTitle || answer.question?.title || "讲解成果" }),
    ...update,
  };
  if (existing) return prisma.shareAsset.update({ where: { id: existing.id }, data });
  return prisma.shareAsset.create({ data });
}

async function syncProjectShareAsset(artifact: any, reviewStatus: string, shareScope: string, teacherNote: string) {
  const update = buildShareAssetAuthorizationUpdate({ reviewStatus, shareScope, teacherNote });
  const existing = await prisma.shareAsset.findFirst({ where: { projectArtifactId: artifact.id } });
  const data = {
    assetType: "PROJECT_OUTCOME" as const,
    userId: artifact.authorId,
    projectId: artifact.projectId,
    projectArtifactId: artifact.id,
    url: artifact.artifactUrl || undefined,
    payload: JSON.stringify({ title: artifact.title }),
    ...update,
  };
  if (existing) return prisma.shareAsset.update({ where: { id: existing.id }, data });
  return prisma.shareAsset.create({ data });
}

export async function POST(req: Request) {
  const auth = await checkTeacherAuth();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const input = normalizeOutcomeReviewInput(await req.json());
    const { sourceType, id, action, reviewStatus, shareScope, teacherNote } = input;

    if (sourceType === "ANSWER") {
      const answer = await prisma.answer.update({
        where: { id },
        data: {
          status: action === "approve" ? "APPROVED" : "REJECTED",
          reviewStatus,
          shareScope,
          mathTip: teacherNote || undefined,
        },
        include: {
          lecturer: true,
          question: { select: { id: true, title: true, suggestedTitle: true } },
        },
      });

      await syncAnswerShareAsset(answer, reviewStatus, shareScope, teacherNote);
      return NextResponse.json({ message: action === "approve" ? "讲解成果已审核" : "讲解成果已退回", outcome: answer });
    }

    if (sourceType === "PROJECT_ARTIFACT") {
      const artifact = await prisma.projectArtifact.update({
        where: { id },
        data: {
          reviewStatus,
          shareScope,
          teacherNote: teacherNote || undefined,
          reviewedAt: new Date(),
          authorizedAt: shareScope === "PUBLIC_HALL" ? new Date() : undefined,
        },
      });

      await syncProjectShareAsset(artifact, reviewStatus, shareScope, teacherNote);

      if (action === "approve") {
        await prisma.$transaction([
          prisma.user.update({
            where: { id: artifact.authorId },
            data: { growthEnergy: { increment: 6 }, points: { increment: 6 } },
          }),
          prisma.pointTransaction.create({
            data: {
              userId: artifact.authorId,
              amount: 6,
              reason: "PROJECT_OUTCOME_APPROVED",
              displayLabel: "项目作品成长能量",
              userMessage: "你和伙伴把探索整理成了作品。真实留下来的过程，会让数学变得有生命。",
              sourceType: "PROJECT",
              sourceId: artifact.id,
              visibility: "PRIVATE",
              affectsIdentityLevel: false,
            },
          }),
        ]);
      }

      return NextResponse.json({ message: action === "approve" ? "项目作品已审核" : "项目作品已退回", outcome: artifact });
    }

    return NextResponse.json({ error: "不支持的成果类型" }, { status: 400 });
  } catch (error: any) {
    console.error("成果审核失败:", error);
    return NextResponse.json({ error: error?.message || "审核失败" }, { status: 500 });
  }
}
