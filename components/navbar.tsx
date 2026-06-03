"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { InfinityLogo } from "@/components/brand/infinity-logo";
import { NAV_LINKS } from "@/lib/product-copy";
import { colors, fonts, handDrawn } from "@/lib/visual-tokens";
import { getPersonalCenterHrefForRole, getVisibleWorkspaceNavForRole } from "@/lib/role-access-boundary-rules.mjs";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = NAV_LINKS;
  const workspaceLinks = getVisibleWorkspaceNavForRole(session?.user?.role);
  const personalCenterHref = getPersonalCenterHrefForRole(session?.user?.role);

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sticky top-0 z-50"
      style={{
        height: "56px",
        background: "transparent",
        borderBottom: "none",
      }}
    >
      {/* 手绘波浪线分隔 - SVG虚线波浪 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: "4px",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='4' viewBox='0 0 40 4'%3E%3Cpath d='M0 2 Q5 0 10 2 T20 2 T30 2 T40 2' fill='none' stroke='rgba(141,110,99,0.35)' stroke-width='2' stroke-dasharray='3,5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "40px 4px",
        }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <InfinityLogo size="sm" />
          </Link>

          {/* Desktop Nav - 中间菜单 */}
          <div className="nav-show-desktop hidden items-center" style={{ gap: "32px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative transition-colors"
                style={{
                  fontFamily: fonts.body,
                  fontSize: "14px",
                  color: isActive(link.href) ? colors.ink : colors.muted,
                  borderBottom: isActive(link.href) ? `2px solid ${colors.ink}` : "none",
                  paddingBottom: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}
            {workspaceLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors"
                style={{
                  fontFamily: fonts.body,
                  fontSize: "14px",
                  color: isActive(link.href) ? colors.ink : colors.muted,
                  borderBottom: isActive(link.href) ? `2px solid ${colors.ink}` : "none",
                  paddingBottom: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop 用户信息/登录 - 桌面端单独显示 */}
          <div className="nav-show-desktop hidden items-center gap-3">
            {status === "loading" ? (
<span style={{ color: colors.muted, fontSize: "14px" }}>加载中...</span>
            ) : session?.user ? (
              <>
                <Link
                  href={personalCenterHref}
                  className="hover:underline"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: "14px",
                    color: colors.ink,
                  }}
                >
                  {session.user.name || session.user.phone}
                </Link>
                <span
                  className="px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: session.user.role === "ADMIN" ? "#FFE0B2" : session.user.role === "TEACHER" ? "#BBDEFB" : "#C8E6C9",
                    border: `1px solid ${colors.border}`,
                    borderRadius: handDrawn.organicRadius,
                    color: colors.ink,
                  }}
                >
                  {session.user.role === "ADMIN" ? "管理员" : session.user.role === "TEACHER" ? "老师" : "学员"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:underline"
                  style={{
                    fontFamily: fonts.body,
                    fontSize: "14px",
                    color: colors.muted,
                  }}
                >
                  退出
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="btn-hand"
                style={{
                  padding: "6px 16px",
                  fontSize: "14px",
                  fontFamily: fonts.title,
                }}
              >
                登录
              </Link>
            )}
          </div>

          {/* Mobile 右侧 - 登录按钮 + 汉堡 */}
          <div className="nav-hide-desktop flex items-center gap-2">
            {status === "loading" ? (
<span style={{ color: colors.muted, fontSize: "14px" }}>加载中...</span>
            ) : session?.user ? (
              <Link
                href={personalCenterHref}
                className="hover:underline"
                style={{
                  fontFamily: fonts.body,
                  fontSize: "14px",
                  color: colors.ink,
                }}
              >
                {session.user.name || session.user.phone}
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-hand"
                style={{
                  padding: "6px 16px",
                  fontSize: "14px",
                  fontFamily: fonts.title,
                }}
              >
                登录
              </Link>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col items-center justify-center gap-1.5"
              style={{
                width: "40px",
                height: "40px",
                border: `2px solid ${colors.border}`,
                borderRadius: handDrawn.organicRadius,
              }}
              aria-label="菜单"
            >
              <span
                className="block w-5 h-0.5 transition-transform"
                style={{
                  background: colors.ink,
                  transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none",
                }}
              />
              <span
                className="block w-5 h-0.5 transition-opacity"
                style={{ background: colors.ink, opacity: menuOpen ? 0 : 1 }}
              />
              <span
                className="block w-5 h-0.5 transition-transform"
                style={{
                  background: colors.ink,
                  transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="nav-hide-desktop px-4 py-3 space-y-1"
          style={{
            background: "rgba(250,250,245,0.96)",
            borderTop: "none",
            backdropFilter: "blur(8px)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5"
              style={{
                fontFamily: fonts.body,
                fontSize: "14px",
                color: isActive(link.href) ? colors.ink : colors.muted,
                borderBottom: isActive(link.href) ? `2px solid ${colors.ink}` : "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          {workspaceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5"
              style={{
                fontFamily: fonts.body,
                fontSize: "14px",
                color: isActive(link.href) ? colors.ink : colors.muted,
                borderBottom: isActive(link.href) ? `2px solid ${colors.ink}` : "none",
              }}
            >
              {link.label}
            </Link>
          ))}

        </div>
      )}
    </nav>
  );
}
