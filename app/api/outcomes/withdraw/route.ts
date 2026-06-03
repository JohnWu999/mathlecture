import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  buildShareAssetAuthorizationUpdate,
  buildWithdrawalUpdate,
} from "@/lib/review-authorization-rules.mjs";

export const dynamic = "force-dynamic";

async function withdrawShareAsset(where: { answerId?: string; projectArtifactId?: string }, reason: string) {
  const existing = await prisma.shareAsset.findFirst({ where });
  if (!existing) return null;
  return prisma.shareAsset.update({
    where: { id: existing.id },
    data: buildShareAssetAuthorizationUpdate({
      reviewStatus: "WITHDRAWN",
      shareScope: "WITHDRAWN",
      withdrawalReason: reason,
    }),
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { sourceType, id, reason = "公开授权已撤回" } = await req.json();
    if (!id || !sourceType) return NextResponse.json({ error: "参数不完整" }, { status: 400 });

    const isTeacher = session.user.role === "TEACHER" || session.user.role === "ADMIN";
    if (!isTeacher) {
      return NextResponse.json({ error: "当前版本仅支持老师/管理员撤回公开授权" }, { status: 403 });
    }

    const withdrawal = buildWithdrawalUpdate({ reason });
    const { deleteSourceRecord: _deleteSourceRecord, ...sourceUpdate } = withdrawal;

    if (sourceType === "ANSWER") {
      const outcome = await prisma.answer.update({
        where: { id },
        data: {
          reviewStatus: "WITHDRAWN",
          shareScope: "WITHDRAWN",
          mathTip: withdrawal.withdrawalReason,
        },
      });
      await withdrawShareAsset({ answerId: id }, withdrawal.withdrawalReason);
      return NextResponse.json({ message: "公开授权已撤回，讲解仍保留为孩子的学习记录。", outcome });
    }

    if (sourceType === "PROJECT_ARTIFACT") {
      const outcome = await prisma.projectArtifact.update({
        where: { id },
        data: sourceUpdate,
      });
      await withdrawShareAsset({ projectArtifactId: id }, withdrawal.withdrawalReason);
      return NextResponse.json({ message: "公开授权已撤回，项目作品仍保留在小组记录中。", outcome });
    }

    return NextResponse.json({ error: "不支持的成果类型" }, { status: 400 });
  } catch (error) {
    console.error("撤回公开授权失败:", error);
    return NextResponse.json({ error: "撤回失败" }, { status: 500 });
  }
}
