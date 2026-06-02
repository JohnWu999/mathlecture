import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401 } as const;
  if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
    return { error: "无权访问", status: 403 } as const;
  }
  return { session } as const;
}

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = await checkTeacherAuth();
  if ("error" in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { sourceType, id, action, shareScope = "GROUP_ONLY", teacherNote = "" } = await req.json();
    if (!id || !sourceType || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }
    const reviewStatus = action === "approve" ? "APPROVED" : "REJECTED";
    const nextShareScope = action === "approve" && shareScope === "PUBLIC_HALL" ? "PUBLIC_HALL" : sourceType === "PROJECT_ARTIFACT" ? "GROUP_ONLY" : "QUESTION_AUTHOR_ONLY";

    if (sourceType === "ANSWER") {
      const answer = await prisma.answer.update({
        where: { id },
        data: {
          status: action === "approve" ? "APPROVED" : "REJECTED",
          reviewStatus,
          shareScope: nextShareScope,
          mathTip: teacherNote || undefined,
        },
        include: { lecturer: true },
      });
      return NextResponse.json({ message: action === "approve" ? "讲解成果已审核" : "讲解成果已退回", outcome: answer });
    }

    if (sourceType === "PROJECT_ARTIFACT") {
      const artifact = await prisma.projectArtifact.update({
        where: { id },
        data: {
          reviewStatus,
          shareScope: nextShareScope,
          teacherNote: teacherNote || undefined,
          reviewedAt: new Date(),
          authorizedAt: nextShareScope === "PUBLIC_HALL" ? new Date() : undefined,
        },
      });

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
  } catch (error) {
    console.error("成果审核失败:", error);
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}
