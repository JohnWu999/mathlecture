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

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const auth = await checkTeacherAuth();
  if (auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const { action } = await req.json(); // "approve" 或 "reject"

    if (action === "approve") {
      const answer = await prisma.answer.update({
        where: { id: params.id },
        data: { status: "APPROVED" },
      });
      // 给小讲师记录私密“讲解成长能量”，不直接兑换身份星级
      await prisma.$transaction([
        prisma.user.update({
          where: { id: answer.lecturerId },
          data: { growthEnergy: { increment: 10 }, points: { increment: 10 } },
        }),
        prisma.pointTransaction.create({
          data: {
            userId: answer.lecturerId,
            amount: 10,
            reason: "ANSWER_APPROVED",
            displayLabel: "讲解成长能量",
            userMessage: "你努力把一道题讲清楚了。讲给别人听，也是让自己的思考长高。",
            sourceType: "ANSWER",
            sourceId: answer.id,
            visibility: "PRIVATE",
            affectsIdentityLevel: false,
          },
        }),
      ]);
      return NextResponse.json({
        message: "已通过",
        growthEnergy: {
          amount: 10,
          displayLabel: "讲解成长能量",
          userMessage: "你努力把一道题讲清楚了。讲给别人听，也是让自己的思考长高。",
        },
      });
    } else {
      await prisma.answer.update({
        where: { id: params.id },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ message: "已拒绝" });
    }
  } catch (error) {
    console.error("审核失败:", error);
    return NextResponse.json({ error: "审核失败" }, { status: 500 });
  }
}

