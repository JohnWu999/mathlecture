"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import bcrypt from "bcryptjs";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"STUDENT" | "TEACHER">("STUDENT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    setLoading(true);

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: hashedPassword,
          role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "注册失败");
      }

      router.push("/login");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-block sticker bg-crayon-blue mb-4">
            <span className="text-3xl">✍️</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">加入联盟</h1>
          <p className="text-ink-light mt-1">注册数学小讲师联盟</p>
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
                昵称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                placeholder="孩子或家长的昵称"
              />
            </div>

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
                身份
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRole("STUDENT")}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all ${
                    role === "STUDENT"
                      ? "border-crayon-green bg-crayon-green/20 font-medium"
                      : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  🏫 学生/家长
                </button>
                <button
                  type="button"
                  onClick={() => setRole("TEACHER")}
                  className={`flex-1 py-2.5 rounded-xl border-2 transition-all ${
                    role === "TEACHER"
                      ? "border-crayon-blue bg-crayon-blue/20 font-medium"
                      : "border-ink/15 hover:border-ink/30"
                  }`}
                >
                  📚 老师
                </button>
              </div>
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
                placeholder="至少6个字符"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">
                确认密码
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                placeholder="再次输入密码"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="hand-btn w-full bg-crayon-blue text-ink disabled:opacity-50"
            >
              {loading ? "注册中..." : "注册"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-light mt-6">
          已有账户？{" "}
          <Link href="/login" className="text-crayon-blue font-medium hover:underline">
            直接登录
          </Link>
        </p>
      </div>
    </main>
  );
}
