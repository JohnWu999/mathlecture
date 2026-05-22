import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";


export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { registrations: true, groups: true } },
        groups: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });
    if (!project) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("获取项目详情失败:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
