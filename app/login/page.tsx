"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [region, setRegion] = useState("海岸城");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

    router.push("/");
    router.refresh();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      alert("注册成功！请等待老师开放权限后登录");
      setMode("login");
      setLoading(false);
    } catch {
      setError("注册失败，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="sticker bg-white w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink text-center mb-6">
          {mode === "login" ? "🔑 登录" : "✍️ 注册"}
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4 bg-red-50 py-2 rounded-lg">
            {error}
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
                className="w-full px-4 py-3 rounded-xl border-2 border-warm/30 focus:border-warm outline-none text-ink bg-warm/5"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-warm/30 focus:border-warm outline-none text-ink bg-warm/5"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-warm/30 focus:border-warm outline-none text-ink bg-warm/5"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-warm/30 focus:border-warm outline-none text-ink bg-warm/5"
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
                    className="w-full px-4 py-3 rounded-xl border-2 border-warm/30 focus:border-warm outline-none text-ink bg-warm/5"
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
            className="hand-btn w-full bg-warm text-white disabled:opacity-50"
          >
            {loading ? "处理中..." : mode === "login" ? "登录" : "注册"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <p className="text-ink-light">
              还没有账号？
              <button
                onClick={() => { setMode("register"); setError(""); }}
                className="text-crayon-blue hover:underline font-medium ml-1"
              >
                立即注册
              </button>
            </p>
          ) : (
            <p className="text-ink-light">
              已有账号？
              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="text-crayon-blue hover:underline font-medium ml-1"
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
    </main>
  );
}
