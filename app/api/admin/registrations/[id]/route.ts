import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getRegistrationStatusAfterFollowUp, normalizeRegistrationFollowUpUpdate } from "@/lib/registration-followup-rules";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const registrationId = params.id;
  if (!registrationId) {
    return NextResponse.json({ error: "缺少报名意向 ID" }, { status: 400 });
  }

  let update;
  try {
    update = normalizeRegistrationFollowUpUpdate(await req.json());
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
        project: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, phone: true } },
      },
    });

    await tx.adminAuditLog.create({
      data: {
        operatorId: auth.session!.user.id,
        action: "UPDATE_REGISTRATION_FOLLOW_UP",
        targetType: "ProjectRegistration",
        targetId: registration.id,
        payload: JSON.stringify({ followUpStatus: update.followUpStatus, status, hasNote: Boolean(update.note) }),
      },
    });

    return registration;
  });

  return NextResponse.json({ message: "报名意向跟进状态已更新", registration: result });
}
