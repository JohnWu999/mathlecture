import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SecurityGuard from "./components/security-guard";
import { SITE } from "@/lib/product-copy";
import { colors, fonts } from "@/lib/visual-tokens";

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.slogan}`,
  description: `${SITE.audience}，${SITE.slogan}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen paper-grid relative">
        {/* 数学涂鸦背景 - 30%面积，只在角落/边缘 */}
        <div className="math-doodle-bg" aria-hidden="true" />
        <div className="math-doodle-corner-bl" aria-hidden="true" />
        <div className="math-doodle-corner-br" aria-hidden="true" />
        <div className="math-doodle-mid-left" aria-hidden="true">+</div>
        <div className="math-doodle-mid-right" aria-hidden="true">×</div>

        <SecurityGuard />
        <Providers>{children}</Providers>

        {/* 版权声明 */}
        <footer className="text-center pt-12 pb-8 text-xs relative z-10" style={{ color: colors.muted, fontFamily: fonts.body }}>
          <p>
            &copy; 2026 {SITE.name} 版权所有
          </p>
          <p className="mt-1">
            未经授权，禁止复制、转载或商业使用本站内容
          </p>
        </footer>
      </body>
    </html>
  );
}
