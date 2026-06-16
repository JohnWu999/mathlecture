import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

async function checkTeacherAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { error: "请先登录", status: 401 };
  if (session.user.role !== "TEACHER") {
    return { error: "无权访问", status: 403 };
  }
  return null;
}

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await checkTeacherAuth();
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const [totalUsers, totalQuestions, totalAnswers, totalProjects, pendingAnswers, totalRegistrations, recentQuestions, recentAnswers, pendingQuestions] = await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.project.count(),
      prisma.answer.count({ where: { status: "PENDING" } }),
      prisma.projectRegistration.count(),
      prisma.question.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, content: true, grade: true, topic: true, reviewStatus: true, status: true, author: { select: { name: true } } },
      }),
      prisma.answer.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, videoUrl: true, description: true, status: true, reviewStatus: true, lecturer: { select: { name: true, grade: true } }, question: { select: { title: true, content: true } } },
      }),
      prisma.question.findMany({
        where: { reviewStatus: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, title: true, author: { select: { name: true } } },
      }),
    ]);

    const pendingReviewItems = [
      ...pendingQuestions.map((item) => ({ id: item.id, type: "待审核问题", title: item.title, owner: item.author?.name || null })),
      ...recentAnswers.filter((item) => item.reviewStatus === "PENDING" || item.status === "PENDING").map((item) => ({ id: item.id, type: "待审核讲题", title: item.question?.title || "讲题视频", owner: item.lecturer?.name || null })),
    ].slice(0, 8);

    return NextResponse.json({
      totalUsers,
      totalQuestions,
      totalAnswers,
      totalProjects,
      pendingAnswers,
      totalRegistrations,
      recentQuestions,
      recentAnswers,
      pendingReviewItems,
    });
  } catch (error) {
    console.error("获取看板数据失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
