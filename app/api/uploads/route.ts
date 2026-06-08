import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { assertUploadAllowed, buildUploadPublicUrl, sanitizeUploadFilename } from "@/lib/upload-rules";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_KINDS = new Set(["question-image", "answer-video", "project-artifact", "consultation-qr"]);

function getUploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录后上传文件" }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const kind = String(form.get("kind") || "");
    const file = form.get("file");

    if (!ALLOWED_KINDS.has(kind)) {
      return NextResponse.json({ error: "未知上传类型" }, { status: 400 });
    }
    if (kind === "consultation-qr" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "只有管理员可以上传咨询二维码" }, { status: 403 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请选择要上传的文件" }, { status: 400 });
    }

    assertUploadAllowed({ kind, mime: file.type, size: file.size });

    const safeName = sanitizeUploadFilename(file.name || "upload");
    const ext = path.extname(safeName) || "";
    const storedName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const dir = path.join(getUploadRoot(), kind);
    await mkdir(dir, { recursive: true });

    const bytes = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(dir, storedName), bytes);

    return NextResponse.json({
      url: buildUploadPublicUrl({ kind, storedName }),
      kind,
      originalName: file.name,
      storedName,
      mimeType: file.type,
      size: file.size,
      uploaderId: session.user.id,
      childMessage: "文件已上传。它只会在老师审核和授权边界内使用。",
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "上传失败" }, { status: 400 });
  }
}
