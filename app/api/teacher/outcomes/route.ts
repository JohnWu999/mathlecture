import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401 } as const;
  if (session.user.role !== "TEACHER") {
    return { error: "无权访问", status: 403 } as const;
  }
  return { session } as const;
}

export const dynamic = "force-dynamic";

function mapAnswerOutcome(answer: any) {
  return {
    id: answer.id,
    sourceType: "ANSWER",
    title: answer.question?.suggestedTitle || answer.question?.title || "一份讲解作品",
    childName: answer.lecturer?.name || "小讲师",
    grade: answer.lecturer?.grade || answer.question?.grade,
    description: answer.description || "孩子用自己的方法讲清楚一道题。",
    artifactUrl: answer.videoUrl,
    reviewStatus: answer.reviewStatus,
    shareScope: answer.shareScope,
    createdAt: answer.createdAt,
    teacherNote: answer.mathTip || "",
    statusLabel: answer.shareScope === "WITHDRAWN" || answer.reviewStatus === "WITHDRAWN" ? "已撤回" : answer.reviewStatus === "PENDING" ? "等待老师审核" : answer.reviewStatus === "APPROVED" && answer.shareScope === "PUBLIC_HALL" ? "已公开" : "仅相关同学可见",
  };
}

function mapProjectArtifactOutcome(artifact: any) {
  return {
    id: artifact.id,
    sourceType: "PROJECT_ARTIFACT",
    title: artifact.title,
    childName: artifact.author?.name || "项目小组",
    grade: artifact.author?.grade,
    projectTitle: artifact.project?.title,
    groupName: artifact.group?.name,
    description: artifact.description || "小组留下了一份项目作品。",
    artifactUrl: artifact.artifactUrl,
    reviewStatus: artifact.reviewStatus,
    shareScope: artifact.shareScope,
    createdAt: artifact.createdAt,
    teacherNote: artifact.teacherNote || "",
    statusLabel: artifact.shareScope === "WITHDRAWN" || artifact.reviewStatus === "WITHDRAWN" ? "已撤回" : artifact.reviewStatus === "PENDING" ? "等待老师审核" : artifact.reviewStatus === "APPROVED" && artifact.shareScope === "PUBLIC_HALL" ? "已公开" : "仅小组可见",
  };
}

export async function GET(req: Request) {
  const auth = await checkTeacherAuth();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "pending";
  const where = view === "public"
    ? { reviewStatus: "APPROVED" as const, shareScope: "PUBLIC_HALL" as const }
    : view === "withdrawn"
      ? { OR: [{ reviewStatus: "WITHDRAWN" as const }, { shareScope: "WITHDRAWN" as const }] }
      : { reviewStatus: "PENDING" as const };

  try {
    const [answers, projectArtifacts] = await Promise.all([
      prisma.answer.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          lecturer: { select: { name: true, grade: true } },
          question: { select: { title: true, suggestedTitle: true, grade: true } },
        },
      }),
      prisma.projectArtifact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
          author: { select: { name: true, grade: true } },
          project: { select: { title: true } },
          group: { select: { name: true } },
        },
      }),
    ]);

    const outcomes = [
      ...answers.map(mapAnswerOutcome),
      ...projectArtifacts.map(mapProjectArtifactOutcome),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({
      outcomes,
      reviewRule: "进入成果广场必须同时满足：老师审核通过、孩子/家长授权公开。",
      withdrawalRule: "公开授权可由家长或老师撤回；撤回后保留作品记录，但不在成果广场展示。",
    });
  } catch (error) {
    console.error("获取成果审核列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
