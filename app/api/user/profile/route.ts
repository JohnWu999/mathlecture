import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "该接口只对学习者账号开放" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        phone: true,
        grade: true,
        region: true,
        points: true,
        growthEnergy: true,
        questionerLevel: true,
        lecturerLevel: true,
        explorerLevel: true,
        learnerIntro: true,
        avatar: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "账号不存在或已被移除，请重新登录" }, { status: 404 });
    }

    const questions = await prisma.question.findMany({
      where: { authorId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    const answers = await prisma.answer.findMany({
      where: { lecturerId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        question: { select: { title: true } },
      },
    });

    const registrations = await prisma.projectRegistration.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        project: { select: { title: true, status: true } },
      },
    });

    const badges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: { select: { name: true, description: true, iconUrl: true } },
      },
    });

    const growthEnergyTransactions = await prisma.pointTransaction.findMany({
      where: { userId: session.user.id, visibility: "PRIVATE" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        amount: true,
        reason: true,
        displayLabel: true,
        userMessage: true,
        sourceType: true,
        sourceId: true,
        affectsIdentityLevel: true,
        createdAt: true,
      },
    });

    const identityProgress = await prisma.identityProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { identityType: "asc" },
      select: {
        identityType: true,
        effectiveCount: true,
        qualityCount: true,
        level: true,
        updatedAt: true,
      },
    });

    const projectAccesses = await prisma.userProjectAccess.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        packageType: true,
        status: true,
        quotaTotal: true,
        quotaUsed: true,
        validUntil: true,
        note: true,
        project: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({
      user,
      questions,
      answers,
      registrations,
      badges,
      growthEnergy: {
        total: user?.growthEnergy ?? 0,
        rankingEnabled: false,
        childExplanation: "数学成长能量记录你提问、讲解、帮助同学和参加项目的过程，不代表谁更聪明。",
        parentExplanation: "成长能量用于帮助孩子看见自己的参与、表达、讲解、合作和项目探索，不用于公开排名，也不直接等同能力高低。",
        recentTransactions: growthEnergyTransactions,
      },
      identityProgress,
      projectAccesses,
    });
  } catch (error) {
    console.error("获取个人资料失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "该接口只对学习者账号开放" }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const avatar = typeof body?.avatar === "string" ? body.avatar.trim() : "";
    if (!avatar.startsWith("/math-young-lecturer/uploads/avatar/")) {
      return NextResponse.json({ error: "请先上传真实头像图片" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { avatar },
      select: { id: true, avatar: true },
    });

    return NextResponse.json({ user, message: "头像已更新" });
  } catch (error) {
    console.error("更新头像失败:", error);
    return NextResponse.json({ error: "头像保存失败" }, { status: 500 });
  }
}

