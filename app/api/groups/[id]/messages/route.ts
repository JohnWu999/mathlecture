import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { buildProjectArtifactDraft, isProjectSubmissionContent } from "@/lib/review-authorization-rules.mjs";

export const dynamic = "force-dynamic";

type SessionUser = {
  id: string;
  role?: string | null;
};

async function assertGroupAccess(groupId: string, sessionUser: SessionUser) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      project: {
        select: {
          id: true,
          title: true,
          durationDays: true,
          knowledgeTags: true,
          projectType: true,
        },
      },
      _count: { select: { members: true } },
    },
  });

  if (!group) {
    return { error: "小组不存在", status: 404 as const };
  }

  if (sessionUser.role === "TEACHER" || sessionUser.role === "ADMIN") {
    return { group };
  }

  const membership = await prisma.groupMember.findFirst({
    where: { groupId, userId: sessionUser.id },
    select: { id: true },
  });
  if (membership) {
    return { group };
  }

  const activeProjectAccess = await prisma.userProjectAccess.findFirst({
    where: {
      userId: sessionUser.id,
      status: "ACTIVE",
      OR: [
        { projectId: group.projectId },
        { projectId: null },
      ],
    },
    select: { id: true },
  });
  if (activeProjectAccess) {
    return { group };
  }

  return { error: "无权访问这个小组协作空间", status: 403 as const };
}

// GET: 获取小组协作空间信息与消息
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const access = await assertGroupAccess(params.id, {
      id: session.user.id,
      role: session.user.role,
    });
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const messages = await prisma.message.findMany({
      where: { groupId: params.id },
      orderBy: { createdAt: "asc" },
      include: {
        author: { select: { name: true } },
      },
      take: 100,
    });

    return NextResponse.json({ group: access.group, messages });
  } catch (error) {
    console.error("获取小组协作空间失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// POST: 发送协作记录
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { content } = await req.json();
    if (!content?.trim()) {
      return NextResponse.json({ error: "协作记录不能为空" }, { status: 400 });
    }

    const access = await assertGroupAccess(params.id, {
      id: session.user.id,
      role: session.user.role,
    });
    if ("error" in access) {
      return NextResponse.json({ error: access.error }, { status: access.status });
    }

    const cleanContent = content.trim();
    const message = await prisma.message.create({
      data: {
        content: cleanContent,
        authorId: session.user.id,
        groupId: params.id,
      },
      include: {
        author: { select: { name: true } },
      },
    });

    let projectArtifact = null;
    if (isProjectSubmissionContent(cleanContent)) {
      const draft = buildProjectArtifactDraft({
        messageId: message.id,
        groupId: access.group.id,
        projectId: access.group.projectId,
        authorId: session.user.id,
        content: cleanContent,
      });
      projectArtifact = await prisma.projectArtifact.create({ data: draft });
    }

    return NextResponse.json({
      message,
      projectArtifact,
      childMessage: projectArtifact
        ? "作品已提交给老师审核。审核通过并获得公开授权后，才会进入成果广场。"
        : "记录已留下。真实的观察、讨论和作品过程，都会帮助老师看见小组的探索。",
    }, { status: 201 });
  } catch (error) {
    console.error("发送协作记录失败:", error);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
