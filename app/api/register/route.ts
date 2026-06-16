import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, phone, password, role, grade, region, province, city } = await req.json();

    if (!phone || !password) {
      return NextResponse.json(
        { error: "手机号和密码不能为空" },
        { status: 400 }
      );
    }

    // 验证手机号格式（简单验证）
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: "请输入正确的手机号" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "该手机号已被注册" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const normalizedRole = role || "STUDENT";
    const normalizedGrade = grade === "K" || grade === "大班" ? 0 : grade ? parseInt(grade) : null;
    const normalizedRegion = [province, city].filter(Boolean).join(" ") || region || null;

    const user = await prisma.user.create({
      data: {
        name: name || "小讲师",
        phone,
        password: hashedPassword,
        role: normalizedRole,
        grade: normalizedGrade,
        region: normalizedRegion,
        isActive: true, // 新学员默认开放你问我答基础参与；免费项目按满员自动成组，老师只查看状态
      },
    });

    return NextResponse.json(
      { message: "注册成功，已自动开放你问我答基础参与", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
