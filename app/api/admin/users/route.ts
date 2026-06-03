import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      grade: true,
      region: true,
      isActive: true,
      createdAt: true,
      projectAccesses: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          packageType: true,
          status: true,
          quotaTotal: true,
          quotaUsed: true,
          validFrom: true,
          validUntil: true,
          note: true,
          project: { select: { id: true, title: true } },
        },
      },
    },
  });

  return NextResponse.json(users);
}
