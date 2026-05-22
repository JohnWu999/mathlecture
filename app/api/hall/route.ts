import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 已采纳的优秀回答
    const topAnswers = await prisma.answer.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        lecturer: { select: { name: true, grade: true } },
        question: { select: { title: true, grade: true } },
      },
    });

    // 已解决的问题
    const solvedQuestions = await prisma.question.findMany({
      where: { status: "RESOLVED" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        author: { select: { name: true } },
        answers: {
          where: { status: "APPROVED" },
          include: {
            lecturer: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ topAnswers, solvedQuestions });
  } catch (error) {
    console.error("获取成果广场失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
