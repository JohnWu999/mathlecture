import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";
import { getProjectAccessDefaults, getProjectAccessPackageOptions } from "@/lib/admin-teacher-workspace-rules";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  return NextResponse.json({ options: getProjectAccessPackageOptions() });
}

export async function POST(req: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const { userId, packageType, projectId, note, paymentAmount } = await req.json();
  if (!userId || !packageType) {
    return NextResponse.json({ error: "缺少用户或项目权限类型" }, { status: 400 });
  }

  const defaults = getProjectAccessDefaults(packageType);
  if (!defaults) {
    return NextResponse.json({ error: "未知项目权限类型" }, { status: 400 });
  }
  if (packageType === "SPECIFIC_PROJECT" && !projectId) {
    return NextResponse.json({ error: "指定项目权限必须选择项目" }, { status: 400 });
  }

  const result = await prisma.$transaction(async (tx) => {
    let paymentRecordId: string | undefined;
    if (typeof paymentAmount === "number" && paymentAmount > 0) {
      const payment = await tx.paymentRecord.create({
        data: {
          userId,
          projectId: projectId || null,
          operatorId: auth.session!.user.id,
          amount: paymentAmount,
          recordType: "PAYMENT",
          status: "CONFIRMED",
          note: note || "管理员手工登记项目权限开通",
        },
      });
      paymentRecordId = payment.id;
    }

    const access = await tx.userProjectAccess.create({
      data: {
        userId,
        projectId: projectId || null,
        openedById: auth.session!.user.id,
        paymentRecordId,
        packageType: defaults.packageType as any,
        quotaTotal: defaults.quotaTotal,
        quotaUsed: defaults.quotaUsed,
        validFrom: defaults.validFrom,
        validUntil: defaults.validUntil,
        status: defaults.status as any,
        note: note || null,
      },
      include: { user: { select: { id: true, name: true, phone: true } }, project: { select: { id: true, title: true } } },
    });

    await tx.adminAuditLog.create({
      data: {
        operatorId: auth.session!.user.id,
        action: "OPEN_PROJECT_ACCESS",
        targetType: "UserProjectAccess",
        targetId: access.id,
        payload: JSON.stringify({ userId, packageType, projectId: projectId || null, paymentAmount: paymentAmount || 0 }),
      },
    });

    return access;
  });

  return NextResponse.json({ message: "项目权限已开通", access: result });
}
