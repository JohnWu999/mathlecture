import type { Metadata } from "next";
import "./globals.css";

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
      </head>
      <body className="min-h-screen paper-grid">
        {children}
      </body>
    </html>
  );
}
