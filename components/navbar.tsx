"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-10 h-10 bg-crayon-green rounded-full flex items-center justify-center text-xl">
          📐
        </div>
        <span className="font-bold text-lg text-ink">数学小讲师联盟</span>
      </Link>

      <div className="flex items-center gap-4 text-sm text-ink-light">
        <Link href="/qa" className="hover:text-ink transition-colors">
          你问我答
        </Link>
        <Link href="/projects" className="hover:text-ink transition-colors">
          项目营
        </Link>
        <Link href="/hall" className="hover:text-ink transition-colors">
          成果广场
        </Link>
        {(session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN") && (
          <Link href="/teacher" className="hover:text-ink transition-colors font-medium">
            📊 老师台
          </Link>
        )}

        {status === "loading" ? (
          <span className="text-ink-light">加载中...</span>
        ) : session?.user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="text-ink font-medium hover:underline">
              {session.user.name || session.user.phone}
            </Link>
            <span className="px-2 py-0.5 bg-crayon-orange/30 rounded-full text-xs font-medium">
              ⚡ {session.user.points || 0}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                session.user.role === "TEACHER"
                  ? "bg-crayon-blue/30 text-ink"
                  : "bg-crayon-green/30 text-ink"
              }`}
            >
              {session.user.role === "TEACHER" ? "老师" : "学员"}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-ink-light hover:text-ink transition-colors"
            >
              退出
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 bg-crayon-green rounded-full text-ink font-medium text-sm hover:shadow-sticker transition-shadow"
          >
            登录 / 注册
          </Link>
        )}
      </div>
    </nav>
  );
}
