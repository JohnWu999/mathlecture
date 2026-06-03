import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const [projects, questions, lectureVideos, projectArtifacts, paymentRecords, auditLogs, registrationIntents] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 30,
      select: {
        id: true,
        title: true,
        projectType: true,
        status: true,
        price: true,
        knowledgeTags: true,
        validUntil: true,
        durationDays: true,
        _count: { select: { registrations: true, groups: true, projectArtifacts: true, projectAccesses: true } },
      },
    }),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        grade: true,
        topic: true,
        confusionType: true,
        reviewStatus: true,
        status: true,
        heatCount: true,
        createdAt: true,
        author: { select: { id: true, name: true, phone: true } },
        claimedBy: { select: { id: true, name: true, phone: true } },
        _count: { select: { answers: true, heats: true } },
      },
    }),
    prisma.answer.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        videoUrl: true,
        description: true,
        status: true,
        reviewStatus: true,
        clarityTags: true,
        shareScope: true,
        mathTip: true,
        createdAt: true,
        question: { select: { id: true, title: true, topic: true } },
        lecturer: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.projectArtifact.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        description: true,
        artifactUrl: true,
        reviewStatus: true,
        shareScope: true,
        teacherNote: true,
        authorizedAt: true,
        withdrawnAt: true,
        createdAt: true,
        author: { select: { id: true, name: true, phone: true } },
        project: { select: { id: true, title: true } },
        group: { select: { id: true, name: true } },
      },
    }),
    prisma.paymentRecord.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        recordType: true,
        amount: true,
        status: true,
        method: true,
        note: true,
        createdAt: true,
        user: { select: { id: true, name: true, phone: true } },
        project: { select: { id: true, title: true } },
        operator: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.adminAuditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        action: true,
        targetType: true,
        targetId: true,
        createdAt: true,
        operator: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.projectRegistration.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        status: true,
        childName: true,
        grade: true,
        packageName: true,
        contact: true,
        note: true,
        followUpStatus: true,
        createdAt: true,
        updatedAt: true,
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
    }),
  ]);

  return NextResponse.json({
    projects,
    questions,
    lectureVideos,
    projectArtifacts,
    paymentRecords,
    auditLogs,
    registrationIntents,
    counts: {
      projects: projects.length,
      questions: questions.length,
      lectureVideos: lectureVideos.length,
      projectArtifacts: projectArtifacts.length,
      paymentRecords: paymentRecords.length,
      auditLogs: auditLogs.length,
      registrationIntents: registrationIntents.length,
    },
  });
}
