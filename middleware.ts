import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, isProtectedPath, hasBasicSession, rateLimitHeaders } from "./lib/api-guard";

// 配置中间件匹配的路径
export const config = {
  matcher: [
    "/api/:path*",
  ],
};

export function middleware(req: NextRequest) {
  // 1. 全局频率限制
  const rateCheck = checkRateLimit(req);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "请求过于频繁，请稍后重试" },
      {
        status: 429,
        headers: rateLimitHeaders(rateCheck.remaining, rateCheck.resetTime),
      }
    );
  }

  // 2. 检查是否是需要保护的路径
  if (isProtectedPath(req.nextUrl.pathname)) {
    // 非登录用户返回 401
    if (!hasBasicSession(req)) {
      return NextResponse.json(
        { error: "请先登录后访问" },
        { status: 401 }
      );
    }
  }

  // 正常请求，添加频率限制头
  const response = NextResponse.next();
  const headers = rateLimitHeaders(rateCheck.remaining, rateCheck.resetTime);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
