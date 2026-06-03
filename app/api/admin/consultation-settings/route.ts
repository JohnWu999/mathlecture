import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { normalizeConsultationSettingInput } from "@/lib/consultation-setting-rules";

export const dynamic = "force-dynamic";

function buildLookupKey(projectId?: string | null) {
  return projectId ? `PROJECT:${projectId}` : "GLOBAL";
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  const settings = await prisma.consultationSetting.findMany({
    orderBy: [{ scope: "asc" }, { updatedAt: "desc" }],
    include: { project: { select: { id: true, title: true } } },
  });
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ settings, projects });
}

export async function POST(req: Request) {
  const { error, session } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const normalized = normalizeConsultationSettingInput(body);
    const lookupKey = buildLookupKey(normalized.projectId);
    if (normalized.projectId) {
      const project = await prisma.project.findUnique({ where: { id: normalized.projectId } });
      if (!project) return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }
    const setting = await prisma.consultationSetting.upsert({
      where: { lookupKey },
      create: {
        lookupKey,
        scope: normalized.scope,
        projectId: normalized.projectId,
        qrImageUrl: normalized.qrImageUrl,
        contactName: normalized.contactName,
        contactTitle: normalized.contactTitle,
        description: normalized.description,
        enabled: normalized.enabled,
      },
      update: {
        qrImageUrl: normalized.qrImageUrl,
        contactName: normalized.contactName,
        contactTitle: normalized.contactTitle,
        description: normalized.description,
        enabled: normalized.enabled,
      },
    });
    await prisma.adminAuditLog.create({
      data: {
        adminId: session!.user.id,
        action: "UPSERT_CONSULTATION_SETTING",
        targetType: "ConsultationSetting",
        targetId: setting.id,
        payload: { scope: setting.scope, projectId: setting.projectId, enabled: setting.enabled },
      },
    });
    return NextResponse.json({ setting, message: "咨询入口配置已保存" });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "保存咨询入口失败" }, { status: 400 });
  }
}
