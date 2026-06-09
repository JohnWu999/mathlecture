"use client";

import { useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { getPostLoginRedirectPath } from "@/lib/login-redirect-rules";
import { PUBLIC_PROFILE_HREF } from "@/lib/public-entry-hrefs.mjs";

async function waitForPostLoginSession() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const session = await getSession();
    if (session?.user?.role) return session;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return getSession();
}

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [region, setRegion] = useState("海岸城");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(result.error === "账号尚未开放，请联系老师" ? result.error : "手机号或密码错误");
      setLoading(false);
      return;
    }

    const session = await waitForPostLoginSession();
    const redirectPath = getPostLoginRedirectPath(session?.user?.role);
    if (redirectPath === "/profile" || !session?.user?.role) {
      window.location.assign(PUBLIC_PROFILE_HREF);
      return;
    }
    router.push(redirectPath);
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setNotice("");

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError("请输入正确的手机号");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/math-young-lecturer/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password, grade, region }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }

      setNotice("注册成功！请等待老师开放权限后登录");
      setMode("login");
      setLoading(false);
    } catch {
      setError("注册失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content forest-page-content-narrow flex min-h-[calc(100vh-110px)] items-center justify-center">
      <div className="forest-login-card forest-panel">
        <div className="forest-page-hero text-center !mb-6">
          <span className="forest-page-eyebrow">内部测试版｜身份入口验收</span>
          <h1 className="forest-page-title !text-3xl">{mode === "login" ? "🔑 登录数学森林" : "✍️ 加入数学森林"}</h1>
          <p className="forest-page-subtitle !text-sm !mx-auto">登录后进入成长护照、提问、项目营和守林人工作台；权限仍按学生、老师、管理员分开。</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}

        {notice && (
          <p role="status" className={`text-sm text-center mb-4 py-2 rounded-lg border ${mode === "login" ? "login" : "register"} ${mode === "login" ? "text-ink bg-crayon-green/20 border-crayon-green/30" : "text-ink bg-crayon-yellow/20 border-crayon-yellow/40"}`}>
            {notice}
          </p>
        )}

        <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-ink-light mb-1">
                名字</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入名字"
                className="w-full hand-input"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="w-full hand-input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-light mb-1">
              密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="w-full hand-input"
              required
              minLength={6}
            />
          </div>

          {mode === "register" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    年级</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full hand-input"
                    required
                  >
                    <option value="">选择年级</option>
                    <option value="1">一年级</option>
                    <option value="2">二年级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-light mb-1">
                    地域</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full hand-input"
                  >
                    <option value="海岸城">海岸城</option>
                    <option value="八达岭">八达岭</option>
                    <option value="后海">后海</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="hand-btn w-full hand-btn-green disabled:opacity-50"
          >
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <p className="text-ink-light">
              还没有账号？
              <button
                onClick={() => { setMode("register"); setError(""); setNotice(""); }}
                className="text-ink hover:underline font-medium ml-1"
              >
                立即注册
              </button>
            </p>
          ) : (
            <p className="text-ink-light">
              已有账号？
              <button
                onClick={() => { setMode("login"); setError(""); setNotice(""); }}
                className="text-ink hover:underline font-medium ml-1"
              >
                去登录
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-ink-light hover:text-ink">
            ← 返回首页
          </Link>
        </div>
      </div>
      </section>
    </main>
  );
}
