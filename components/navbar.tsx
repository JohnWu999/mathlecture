"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto relative z-20">
      <Link href="/" className="flex items-center gap-2">
        <div className="hand-icon text-xl">
          📐
        </div>
        <span className="font-bold text-lg handwritten-title" style={{ color: "#3E2723" }}>数学小讲师联盟</span>
      </Link>

      <div className="flex items-center gap-4 text-sm text-ink-light">
        <Link href="/qa" className="hover:text-ink transition-colors" style={{ color: "#5D4E44" }}>
          你问我答
        </Link>
        <Link href="/projects" className="hover:text-ink transition-colors" style={{ color: "#5D4E44" }}>
          项目营
        </Link>
        <Link href="/hall" className="hover:text-ink transition-colors" style={{ color: "#5D4E44" }}>
          成果广场
        </Link>
        {(session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN") && (
          <Link href="/teacher" className="hover:text-ink transition-colors font-medium" style={{ color: "#5D4E44" }}>
            📊 老师台
          </Link>
        )}

        {status === "loading" ? (
          <span style={{ color: "#8D7E72" }}>加载中...</span>
        ) : session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="font-medium hover:underline" style={{ color: "#3E2723" }}>
              {session.user.name || session.user.phone}
            </Link>
            <span className="hand-badge hand-badge-orange text-xs">
              ⚡ {session.user.points || 0}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                session.user.role === "TEACHER"
                  ? "hand-badge hand-badge-blue"
                  : "hand-badge hand-badge-green"
              }`}
            >
              {session.user.role === "TEACHER" ? "老师" : "学员"}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hover:text-ink transition-colors"
              style={{ color: "#8D7E72" }}
            >
              退出
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="hand-btn hand-btn-green text-sm"
          >
            登录 / 注册
          </Link>
        )}
      </div>
    </nav>
  );
}
