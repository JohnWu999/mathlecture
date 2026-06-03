import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeProjectRegistrationIntent, getEnterpriseWechatPrompt } from "@/lib/p0-closure-rules";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录", loginRequired: true }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const intent = normalizeProjectRegistrationIntent(body);

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project || project.status !== "PUBLISHED") {
      return NextResponse.json({ error: "项目不存在或未开放报名" }, { status: 404 });
    }

    const existing = await prisma.projectRegistration.findUnique({
      where: { userId_projectId: { userId: session.user.id, projectId: params.id } },
    });

    if (existing) {
      return NextResponse.json({ error: "你已经提交过该项目报名意向，老师会根据项目节奏继续跟进。" }, { status: 409 });
    }

    const registration = await prisma.projectRegistration.create({
      data: {
        userId: session.user.id,
        projectId: params.id,
        status: intent.status,
        childName: intent.childName,
        grade: intent.grade,
        packageName: intent.packageName,
        contact: intent.contact,
        note: intent.note,
        followUpStatus: intent.followUpStatus,
      },
    });

    return NextResponse.json({
      registration,
      childMessage: "报名意向已提交。请添加企业微信，老师会人工确认项目节奏、名额和服务内容。",
      enterpriseWechat: getEnterpriseWechatPrompt(),
    }, { status: 201 });
  } catch (error: any) {
    console.error("报名失败:", error);
    return NextResponse.json({ error: error.message || "报名失败" }, { status: 400 });
  }
}
