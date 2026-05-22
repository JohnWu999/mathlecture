import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { name: true } },
        answers: {
          include: {
            lecturer: { select: { name: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ error: "问题不存在" }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error("获取问题详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
