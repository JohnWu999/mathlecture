"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/qa", label: "你问我答" },
    { href: "/projects", label: "项目营" },
    { href: "/hall", label: "成果广场" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav
      className="sticky top-0 z-50 bg-transparent"
      style={{
        height: "56px",
        borderBottom: "1px solid rgba(141,110,99,0.3)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            {/* Logo 图占位 */}
            <div
              className="flex items-center justify-center"
              style={{
                width: "32px",
                height: "32px",
                border: "2px solid #8D6E63",
                borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                transform: "rotate(-3deg)",
              }}
            >
              <span
                style={{
                  fontFamily: "'ZCOOL KuaiLe', cursive",
                  fontSize: "14px",
                  color: "#3E2723",
                }}
              >
                &#8734;
              </span>
            </div>
            <span
              style={{
                fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
                fontSize: "18px",
                color: "#3E2723",
              }}
            >
              数学小讲师联盟
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center" style={{ gap: "32px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative transition-colors"
                style={{
                  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                  fontSize: "14px",
                  color: isActive(link.href) ? "#3E2723" : "#8D6E63",
                  borderBottom: isActive(link.href) ? "2px solid #3E2723" : "none",
                  paddingBottom: "2px",
                }}
              >
                {link.label}
              </Link>
            ))}
            {(session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN") && (
              <Link
                href="/teacher"
                className="transition-colors"
                style={{
                  fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                  fontSize: "14px",
                  color: isActive("/teacher") ? "#3E2723" : "#8D6E63",
                  borderBottom: isActive("/teacher") ? "2px solid #3E2723" : "none",
                  paddingBottom: "2px",
                }}
              >
                老师台
              </Link>
            )}

            {status === "loading" ? (
              <span style={{ color: "#8D6E63", fontSize: "14px" }}>加载中...</span>
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="hover:underline"
                  style={{
                    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                    fontSize: "14px",
                    color: "#3E2723",
                  }}
                >
                  {session.user.name || session.user.phone}
                </Link>
                <span
                  className="px-2 py-0.5 text-xs font-medium"
                  style={{
                    background: session.user.role === "TEACHER" ? "#BBDEFB" : "#C8E6C9",
                    border: "1px solid #8D6E63",
                    borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
                    color: "#3E2723",
                  }}
                >
                  {session.user.role === "TEACHER" ? "老师" : "学员"}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:underline"
                  style={{
                    fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                    fontSize: "14px",
                    color: "#8D6E63",
                  }}
                >
                  退出
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="btn-hand"
                style={{
                  padding: "6px 16px",
                  fontSize: "14px",
                  fontFamily: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
                }}
              >
                登陆
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex flex-col items-center justify-center gap-1.5"
            style={{
              width: "40px",
              height: "40px",
              border: "2px solid #8D6E63",
              borderRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
            }}
            aria-label="菜单"
          >
            <span
              className="block w-5 h-0.5 bg-[#3E2723] transition-transform"
              style={{
                transform: menuOpen ? "rotate(45deg) translateY(6px)" : "none",
              }}
            />
            <span
              className="block w-5 h-0.5 bg-[#3E2723] transition-opacity"
              style={{ opacity: menuOpen ? 0 : 1 }}
            />
            <span
              className="block w-5 h-0.5 bg-[#3E2723] transition-transform"
              style={{
                transform: menuOpen ? "rotate(-45deg) translateY(-6px)" : "none",
              }}
            />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div
          className="md:hidden px-4 py-3 space-y-1"
          style={{
            background: "#FAFAF5",
            borderTop: "1px solid rgba(141,110,99,0.3)",
          }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5"
              style={{
                fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                fontSize: "14px",
                color: isActive(link.href) ? "#3E2723" : "#8D6E63",
                borderBottom: isActive(link.href) ? "2px solid #3E2723" : "none",
              }}
            >
              {link.label}
            </Link>
          ))}
          {(session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN") && (
            <Link
              href="/teacher"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2.5"
              style={{
                fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
                fontSize: "14px",
                color: isActive("/teacher") ? "#3E2723" : "#8D6E63",
                borderBottom: isActive("/teacher") ? "2px solid #3E2723" : "none",
              }}
            >
              老师台
            </Link>
          )}
          {!session?.user && (
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="block mt-2 btn-hand text-center"
              style={{ padding: "6px 16px", fontSize: "14px" }}
            >
              登陆
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
