import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { normalizeProjectRegistrationIntent } from "@/lib/p0-closure-rules";
import { buildConsultationDisplay, chooseEffectiveConsultationSetting } from "@/lib/consultation-setting-rules";

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

    const isFreeProject = project.projectType === "FREE" || (project.price || 0) === 0;
    const registration = await prisma.projectRegistration.create({
      data: {
        userId: session.user.id,
        projectId: params.id,
        status: isFreeProject ? "CONFIRMED" : intent.status,
        childName: intent.childName,
        grade: intent.grade,
        packageName: intent.packageName,
        contact: intent.contact,
        note: intent.note,
        followUpStatus: isFreeProject ? "CONFIRMED" : intent.followUpStatus,
        teacherWechatShown: true,
      },
    });

    const [projectSetting, globalSetting] = await Promise.all([
      prisma.consultationSetting.findUnique({ where: { lookupKey: `PROJECT:${params.id}` } }),
      prisma.consultationSetting.findUnique({ where: { lookupKey: "GLOBAL" } }),
    ]);
    const consultation = buildConsultationDisplay(chooseEffectiveConsultationSetting({ projectSetting, globalSetting }));

    return NextResponse.json({
      registration,
      childMessage: isFreeProject
        ? "报名成功。免费项目满人数即可成组，老师工作台只查看学习状态和项目过程。"
        : consultation
          ? "报名意向已提交。请扫码添加项目咨询老师，人工确认项目节奏、名额和服务内容。"
          : "报名意向已提交。老师会人工确认项目节奏、名额和服务内容。",
      consultation,
      enterpriseWechat: consultation?.description || "报名意向已记录，管理员会在后台跟进状态。",
    }, { status: 201 });
  } catch (error: any) {
    console.error("报名失败:", error);
    return NextResponse.json({ error: error.message || "报名失败" }, { status: 400 });
  }
}
