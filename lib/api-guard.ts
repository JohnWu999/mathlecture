/**
 * API 基础安全保护
 * - 简单的请求频率限制（基于 IP，内存级）
 * - 非登录用户限制访问敏感接口
 * 注意：这是"增加门槛"，不是绝对安全
 */

import { NextRequest, NextResponse } from "next/server";

// 简单的内存级频率限制器
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟
const RATE_LIMIT_MAX = 60; // 每分钟最多 60 请求

function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = req.headers.get("x-real-ip");
  if (realIP) return realIP;
  return "unknown";
}

export function checkRateLimit(req: NextRequest): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const ip = getClientIP(req);
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // 新窗口期，初始化
    const newRecord = { count: 1, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitMap.set(ip, newRecord);
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetTime: record.resetTime };
}

// 需要登录才能访问的 API 路径
const PROTECTED_PATHS = [
  "/api/answers",
  "/api/answers/",
  "/api/groups/",
  "/api/projects/",
  "/api/projects/",
  "/api/questions/",
  "/api/questions/",
  "/api/user/profile",
  "/api/teacher/",
];

// 允许匿名访问的公开接口
const PUBLIC_PATHS = [
  "/api/auth",
  "/api/register",
  "/api/hall",
];

export function isProtectedPath(pathname: string): boolean {
  // 先检查是否是公开路径
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return false;
  }
  // 检查是否是受保护路径
  return PROTECTED_PATHS.some((p) => pathname.startsWith(p));
}

// 从 Cookie 中获取简单的会话信息（非 NextAuth 官方会话，仅作为基础门槛）
export function hasBasicSession(req: NextRequest): boolean {
  const sessionCookie = req.cookies.get("next-auth.session-token")?.value;
  return !!sessionCookie;
}

// API 路由中使用的统一响应头
export function rateLimitHeaders(remaining: number, resetTime: number) {
  return {
    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetTime / 1000)),
  };
}
