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
      <body className="min-h-screen paper-grid">
        <SecurityGuard />
        <Providers>{children}</Providers>
        {/* 版权声明 */}
        <footer className="text-center py-6 text-sm" style={{ color: "#8A7B6D" }}>
          <p>© 2026 数学小讲师联盟 版权所有</p>
          <p className="mt-1 text-xs">
            未经授权，禁止复制、转载或商业使用本站内容
          </p>
        </footer>
      </body>
    </html>
  );
}
