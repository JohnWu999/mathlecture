import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// 获取问题列表
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "OPEN";
  const grade = searchParams.get("grade");

  const where: any = { status };
  if (grade) where.grade = parseInt(grade);

  const questions = await prisma.question.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: { select: { name: true, region: true } },
      answers: { select: { id: true, status: true } },
    },
  });

  return NextResponse.json(questions);
}

// 创建问题
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { title, content, imageUrl, isAnonymous, grade, topic } = await req.json();

    const question = await prisma.question.create({
      data: {
        title,
        content,
        imageUrl,
        isAnonymous: isAnonymous || false,
        grade: grade ? parseInt(grade) : null,
        topic,
        authorId: session.user.id,
      },
    });

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("创建问题失败:", error);
    return NextResponse.json({ error: "创建问题失败" }, { status: 500 });
  }
}
