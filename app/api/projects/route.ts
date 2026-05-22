import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { registrations: true, groups: true } },
      },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("获取项目列表失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
