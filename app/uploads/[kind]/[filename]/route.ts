import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_UPLOAD_KINDS = new Set(["avatar", "question-image", "answer-video", "project-artifact", "consultation-qr"]);

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".pdf": "application/pdf",
  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".wav": "audio/wav",
};

function getUploadRoot() {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "public", "uploads");
}

function isSafePathSegment(value: string) {
  return Boolean(value) && !value.includes("..") && !value.includes("/") && !value.includes("\\");
}

export async function GET(_req: Request, { params }: { params: { kind: string; filename: string } }) {
  const kind = String(params.kind || "");
  const filename = String(params.filename || "");

  if (!ALLOWED_UPLOAD_KINDS.has(kind) || !isSafePathSegment(filename)) {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }

  try {
    const absolutePath = path.join(getUploadRoot(), kind, filename);
    const bytes = await readFile(absolutePath);
    const ext = path.extname(filename).toLowerCase();
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "文件不存在" }, { status: 404 });
  }
}
