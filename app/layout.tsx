import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import SecurityGuard from "./components/security-guard";

export const metadata: Metadata = {
  title: "数学小讲师联盟 — 会思考，爱数学",
  description: "小学一二年级孩子的数学伙伴互助平台，会思考，爱数学",
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
        <footer className="text-center pt-12 pb-8 text-xs relative z-10" style={{ color: "#8D6E63", fontFamily: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif" }}>
          <p>
            &copy; 2026 数学小讲师联盟 版权所有
          </p>
          <p className="mt-1">
            未经授权，禁止复制、转载或商业使用本站内容
          </p>
        </footer>
      </body>
    </html>
  );
}
