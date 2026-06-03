import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildConsultationDisplay, chooseEffectiveConsultationSetting } from "@/lib/consultation-setting-rules";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");

  const [projectSetting, globalSetting] = await Promise.all([
    projectId ? prisma.consultationSetting.findUnique({ where: { lookupKey: `PROJECT:${projectId}` } }) : Promise.resolve(null),
    prisma.consultationSetting.findUnique({ where: { lookupKey: "GLOBAL" } }),
  ]);

  const effective = chooseEffectiveConsultationSetting({ projectSetting, globalSetting });
  return NextResponse.json({ consultation: buildConsultationDisplay(effective) });
}
