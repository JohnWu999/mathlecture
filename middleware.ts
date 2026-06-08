import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { checkRateLimit, isProtectedPath, hasBasicSession, rateLimitHeaders } from "./lib/api-guard";
import { getLegacyPathRedirectTarget } from "./lib/legacy-path-redirect-rules";
import {
  canAccessAdminOperationApi,
  canAccessTeacherOperationApi,
  canAccessWorkspacePath,
  getRequiredRoleForWorkspacePath,
  getRoleHomePath,
} from "./lib/role-access-boundary-rules";

const BASE_PATH = "/math-young-lecturer";

function stripBasePath(pathname: string) {
  if (pathname === BASE_PATH) return "/";
  if (pathname.startsWith(`${BASE_PATH}/`)) return pathname.slice(BASE_PATH.length) || "/";
  return pathname;
}

function withBasePath(pathname: string) {
  if (pathname.startsWith(BASE_PATH)) return pathname;
  return `${BASE_PATH}${pathname === "/" ? "" : pathname}`;
}

function redirectTo(req: NextRequest, pathname: string, status = 307) {
  const url = req.nextUrl.clone();
  // In a Next.js app configured with basePath, `NextURL` already tracks
  // `req.nextUrl.basePath`. Setting pathname to the app-relative path lets
  // Next serialize the deploy prefix exactly once. Manually adding BASE_PATH
  // here produces /math-young-lecturer/math-young-lecturer/login on protected
  // routes in production.
  url.pathname = pathname;
  url.search = "";
  return NextResponse.redirect(url, status);
}

export async function middleware(req: NextRequest) {
  const normalizedPath = stripBasePath(req.nextUrl.pathname);
  const legacyTarget = getLegacyPathRedirectTarget(`${req.nextUrl.pathname}${req.nextUrl.search}`, {
    requestBasePath: req.nextUrl.basePath,
  });
  if (legacyTarget) {
    const url = req.nextUrl.clone();
    const [pathname, query = ""] = legacyTarget.split("?");
    url.pathname = pathname;
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url, 308);
  }

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

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const role = typeof token?.role === "string" ? token.role : "";

  // 2. 页面级身份边界：工作台不能作为身份切换器
  const requiredWorkspaceRole = getRequiredRoleForWorkspacePath(normalizedPath);
  if (requiredWorkspaceRole) {
    if (!token) return redirectTo(req, "/login");
    if (!canAccessWorkspacePath(role, normalizedPath)) {
      return redirectTo(req, getRoleHomePath(role));
    }
  }

  // 3. API 级身份边界：老师 API 和管理员 API 分离
  if (normalizedPath.startsWith("/api/teacher/")) {
    if (!token && !hasBasicSession(req)) return NextResponse.json({ error: "请先登录后访问" }, { status: 401 });
    if (!canAccessTeacherOperationApi(role)) return NextResponse.json({ error: "无权访问老师工作台接口" }, { status: 403 });
  }
  if (normalizedPath.startsWith("/api/admin/")) {
    if (!token && !hasBasicSession(req)) return NextResponse.json({ error: "请先登录后访问" }, { status: 401 });
    if (!canAccessAdminOperationApi(role)) return NextResponse.json({ error: "无权访问管理员后台接口" }, { status: 403 });
  }

  // 4. 其他受保护 API 的基础登录门槛
  if (isProtectedPath(normalizedPath)) {
    if (!token && !hasBasicSession(req)) {
      return NextResponse.json(
        { error: "请先登录后访问" },
        { status: 401 }
      );
    }
  }

  const response = NextResponse.next();
  const headers = rateLimitHeaders(rateCheck.remaining, rateCheck.resetTime);
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/login",
    "/register",
    "/admin/:path*",
    "/admin",
    "/teacher/:path*",
    "/teacher",
    "/profile/:path*",
    "/profile",
    "/qa/:path*",
    "/projects/:path*",
    "/hall/:path*",
    "/groups/:path*",
  ],
};
