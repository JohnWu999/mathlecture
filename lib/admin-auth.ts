import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "请先登录" }, { status: 401 }), session: null } as const;
  }
  if (session.user.role !== "ADMIN") {
    return { error: NextResponse.json({ error: "仅管理员可操作" }, { status: 403 }), session } as const;
  }
  return { error: null, session } as const;
}
