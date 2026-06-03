import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getRegistrationStatusAfterFollowUp, normalizeRegistrationFollowUpUpdate } from "@/lib/registration-followup-rules";
import { getProjectAccessDefaults } from "@/lib/admin-teacher-workspace-rules";
import {
  buildAccessOpenAuditPayload,
  buildAccessTodoFromRegistration,
  buildConfirmedRegistrationAccessInput,
} from "@/lib/project-access-linkage-rules";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const registrationId = params.id;
  if (!registrationId) {
    return NextResponse.json({ error: "缺少报名意向 ID" }, { status: 400 });
  }

  let update;
  let openProjectAccess = false;
  try {
    const body = await req.json();
    update = normalizeRegistrationFollowUpUpdate(body);
    openProjectAccess = Boolean(body.openProjectAccess);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "跟进状态无效" }, { status: 400 });
  }

  const status = getRegistrationStatusAfterFollowUp(update.followUpStatus);

  const result = await prisma.$transaction(async (tx) => {
    const registration = await tx.projectRegistration.update({
      where: { id: registrationId },
      data: {
        followUpStatus: update.followUpStatus as any,
        status: status as any,
        note: update.note,
      },
      select: {
        id: true,
        status: true,
        followUpStatus: true,
        note: true,
        childName: true,
        grade: true,
        packageName: true,
        contact: true,
        updatedAt: true,
        projectId: true,
        userId: true,
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    let access: any = null;
    let accessAlreadyExists = false;
    const accessTodo = buildAccessTodoFromRegistration({ ...registration, projectAccesses: [] });

    if (openProjectAccess) {
      const accessInput = buildConfirmedRegistrationAccessInput(registration, { operatorId: auth.session!.user.id });
      const existingAccess = await tx.userProjectAccess.findFirst({
        where: {
          userId: accessInput.userId,
          projectId: accessInput.projectId,
          status: "ACTIVE",
        },
        select: { id: true, packageType: true, status: true, projectId: true },
      });

      if (existingAccess) {
        accessAlreadyExists = true;
        access = existingAccess;
      } else {
        const defaults = getProjectAccessDefaults("SPECIFIC_PROJECT");
        access = await tx.userProjectAccess.create({
          data: {
            userId: accessInput.userId,
            projectId: accessInput.projectId,
            openedById: accessInput.openedById,
            packageType: "SPECIFIC_PROJECT",
            quotaTotal: defaults?.quotaTotal ?? 1,
            quotaUsed: defaults?.quotaUsed ?? 0,
            validFrom: defaults?.validFrom ?? new Date(),
            validUntil: defaults?.validUntil ?? null,
            status: "ACTIVE",
            note: accessInput.note,
          },
          include: { project: { select: { id: true, title: true } }, user: { select: { id: true, name: true, phone: true } } },
        });

        await tx.adminAuditLog.create({
          data: {
            operatorId: auth.session!.user.id,
            action: "OPEN_PROJECT_ACCESS_FROM_CONFIRMED_REGISTRATION",
            targetType: "UserProjectAccess",
            targetId: access.id,
            payload: JSON.stringify(buildAccessOpenAuditPayload({ registrationId: registration.id, accessId: access.id, userId: registration.user.id, projectId: registration.project.id, packageType: "SPECIFIC_PROJECT" })),
          },
        });
      }
    }

    await tx.adminAuditLog.create({
      data: {
        operatorId: auth.session!.user.id,
        action: "UPDATE_REGISTRATION_FOLLOW_UP",
        targetType: "ProjectRegistration",
        targetId: registration.id,
        payload: JSON.stringify({ followUpStatus: update.followUpStatus, status, hasNote: Boolean(update.note), openProjectAccess, accessId: access?.id || null, accessAlreadyExists }),
      },
    });

    return { registration, access, accessAlreadyExists, accessTodo };
  });

  const message = result.access
    ? result.accessAlreadyExists
      ? "报名意向跟进状态已更新；该学生已有对应项目权益，未重复开通"
      : "报名意向已确认，并已同步开通项目权益"
    : "报名意向跟进状态已更新";
  return NextResponse.json({ message, ...result });
}
