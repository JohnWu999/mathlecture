"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("邮箱或密码不正确");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block sticker bg-crayon-yellow mb-4">
            <span className="text-3xl">📐</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">欢迎回来</h1>
          <p className="text-ink-light mt-1">登录数学小讲师联盟</p>
        </div>

        <div className="sticker bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-2 bg-crayon-pink/50 rounded-lg text-sm text-ink">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                邮箱
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                placeholder="输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hand-btn w-full bg-crayon-green text-ink disabled:opacity-50"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-light mt-6">
          还没有账户？{" "}
          <Link href="/register" className="text-crayon-green font-medium hover:underline">
            立即注册
          </Link>
        </p>
      </div>
    </main>
  );
}
