"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { getPersonalCenterHrefForRole, getVisibleWorkspaceNavForRole } from "@/lib/role-access-boundary-rules.mjs";

const mainLinks = [
  { href: "/qa", label: "你问我答" },
  { href: "/projects", label: "项目营" },
  { href: "/hall", label: "成果广场" },
  { href: "/profile", label: "个人中心" },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 140 86" aria-label="两个孩子握手形成无限符号">
      <path
        d="M20 43C36 10 62 11 70 43C78 75 104 76 120 43C104 10 78 11 70 43C62 75 36 76 20 43Z"
        fill="none"
        stroke="#2f8f67"
        strokeWidth="9.5"
        strokeLinecap="round"
      />
      <circle cx="48" cy="27" r="8" fill="#ffd166" />
      <circle cx="92" cy="59" r="8" fill="#3b82f6" />
      <path d="M58 39c7 7 17 7 24 0" fill="none" stroke="#f9733d" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const workspaceLinks = getVisibleWorkspaceNavForRole(session?.user?.role);
  const personalCenterHref = getPersonalCenterHrefForRole(session?.user?.role);
  const links = [...mainLinks, ...workspaceLinks];
  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav className="forest-site-nav" aria-label="主导航">
      <div className="nav-inner">
        <Link href="/" className="forest-brand" aria-label="数学小讲师联盟首页">
          <LogoMark />
          <span>数学小讲师联盟</span>
        </Link>

        <div className="forest-navlinks">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={isActive(link.href) ? "active" : ""}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mobile-quick-links" aria-label="手机分页导航">
          {mainLinks.map((link, index) => (
            <span className="mobile-quick-item" key={link.href}>
              <Link href={link.href} className={isActive(link.href) ? "active" : ""}>
                {link.label}
              </Link>
              {index < mainLinks.length - 1 && <span className="mobile-separator" aria-hidden="true">｜</span>}
            </span>
          ))}
        </div>

        <div className="nav-actions">
          <Link className="ask" href="/qa/ask">我要提问</Link>
          {status === "loading" ? (
            <span className="login muted">加载中...</span>
          ) : session?.user ? (
            <>
              <Link href={personalCenterHref} className="login">{session.user.name || session.user.phone}</Link>
              <button className="logout" onClick={() => signOut({ callbackUrl: "/" })}>退出</button>
            </>
          ) : (
            <Link className="login" href="/login">登录</Link>
          )}
          <button className="menu-button" type="button" aria-label="菜单" aria-expanded={menuOpen} onClick={() => setMenuOpen((v) => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className={isActive(link.href) ? "active" : ""}>
              {link.label}
            </Link>
          ))}
          <Link href="/qa/ask" onClick={() => setMenuOpen(false)} className="mobile-ask">我要提问</Link>
        </div>
      )}

      <style jsx>{`
        .forest-site-nav {
          position: sticky;
          top: 0;
          z-index: 80;
          min-height: 76px;
          background: rgba(255, 248, 232, 0.82);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(24, 70, 56, 0.08);
          color: #184638;
        }
        .nav-inner {
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 0 56px;
        }
        .forest-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: max-content;
          font-weight: 950;
          letter-spacing: -0.02em;
          color: #184638;
          text-decoration: none;
        }
        .forest-brand svg { width: 56px; height: 38px; }
        .forest-navlinks {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 26px;
          flex: 1;
          font-size: 15px;
          font-weight: 850;
          color: rgba(24, 70, 56, 0.72);
        }
        .forest-navlinks a,
        .mobile-menu a,
        .mobile-quick-links a,
        .login,
        .logout {
          color: inherit;
          text-decoration: none;
        }
        .forest-navlinks a.active,
        .forest-navlinks a:hover,
        .mobile-menu a.active {
          color: #184638;
        }
        .forest-navlinks a.active {
          box-shadow: inset 0 -8px 0 rgba(255, 209, 102, 0.62);
        }
        .mobile-quick-links {
          display: none;
          align-items: center;
          justify-content: center;
          gap: 0;
          flex: 1;
          min-width: 0;
          color: rgba(24, 70, 56, 0.74);
          font-size: 13px;
          font-weight: 900;
          white-space: nowrap;
        }
        .mobile-quick-item {
          display: inline-flex;
          align-items: center;
          min-width: 0;
        }
        .mobile-quick-links a.active {
          color: #184638;
          box-shadow: inset 0 -6px 0 rgba(255, 209, 102, 0.52);
        }
        .mobile-separator {
          display: inline-flex;
          align-items: center;
          padding: 0 4px;
          color: rgba(24, 70, 56, 0.32);
          font-weight: 700;
        }
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: max-content;
        }
        .ask {
          background: #184638;
          color: #fff;
          padding: 12px 18px;
          border-radius: 999px;
          box-shadow: 0 14px 38px rgba(24, 70, 56, 0.12);
          font-size: 14px;
          font-weight: 950;
          text-decoration: none;
        }
        .login,
        .logout {
          border: 1px solid rgba(24, 70, 56, 0.12);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.62);
          padding: 10px 14px;
          font-size: 14px;
          font-weight: 850;
          color: #184638;
        }
        .logout { cursor: pointer; }
        .muted { color: #435f54; }
        .menu-button {
          display: none;
          width: 44px;
          height: 44px;
          border: 1px solid rgba(24, 70, 56, 0.16);
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.66);
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
        }
        .menu-button span {
          display: block;
          width: 20px;
          height: 2px;
          border-radius: 999px;
          background: #184638;
        }
        .mobile-menu {
          display: none;
          padding: 8px 22px 18px;
          background: rgba(255, 248, 232, 0.96);
          border-top: 1px solid rgba(24, 70, 56, 0.08);
        }
        .mobile-menu a {
          display: block;
          padding: 12px 6px;
          font-size: 15px;
          font-weight: 850;
          color: #435f54;
        }
        .mobile-menu .mobile-ask {
          margin-top: 8px;
          text-align: center;
          color: #fff;
          background: #f9733d;
          border-radius: 999px;
        }
        @media (max-width: 1100px) {
          .nav-inner { padding: 0 22px; }
          .forest-navlinks { display: none; }
          .ask { display: none; }
          .menu-button { display: flex; }
          .mobile-menu { display: block; }
        }
        @media (max-width: 620px) {
          .forest-site-nav { min-height: 94px; }
          .nav-inner {
            height: auto;
            min-height: 94px;
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
            align-items: center;
            justify-items: stretch;
            row-gap: 7px;
            column-gap: 0;
            padding: 9px 12px 8px;
            position: relative;
          }
          .forest-brand {
            grid-column: 1 / -1;
            grid-row: 1;
            flex-direction: column;
            justify-content: center;
            align-items: flex-end;
            gap: 1px;
            min-width: 0;
            line-height: 1.05;
            text-align: right;
          }
          .forest-brand svg {
            width: 18px;
            height: 12px;
            max-width: 18px;
            max-height: 12px;
            flex: 0 0 18px;
            display: block;
          }
          .forest-brand span {
            display: block;
            font-size: 11px;
            letter-spacing: 0.02em;
            white-space: nowrap;
          }
          .mobile-quick-links {
            display: flex;
            grid-column: 1 / -1;
            grid-row: 2;
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            justify-content: flex-end;
            text-align: right;
            padding: 0;
            scrollbar-width: none;
          }
          .mobile-quick-links::-webkit-scrollbar { display: none; }
          .login, .logout { display: none; }
          .nav-actions {
            display: none;
          }
          .menu-button { display: none; }
          .mobile-menu { display: none; }
        }
      `}</style>
    </nav>
  );
}
