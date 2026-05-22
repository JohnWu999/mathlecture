"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

export default function AskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [grade, setGrade] = useState("1");
  const [topic, setTopic] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("请先登录");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/math-young-lecturer/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          grade: parseInt(grade),
          topic,
          isAnonymous,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "提问失败");
      }

      router.push("/qa");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-block sticker bg-crayon-yellow mb-3">
            <span className="text-3xl">🙋</span>
          </div>
          <h1 className="text-2xl font-bold text-ink">我要提问</h1>
          <p className="text-ink-light mt-1">大胆说出你的困惑，小伙伴会来帮你</p>
        </div>

        <div className="sticker bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-2 bg-crayon-pink/50 rounded-lg text-sm text-ink">{error}</div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">问题标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                placeholder="例如：这道应用题怎么理解？"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">年级</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                >
                  <option value="1">一年级</option>
                  <option value="2">二年级</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">主题</label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors"
                  placeholder="如：加减法、图形"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">问题描述</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none transition-colors resize-none"
                placeholder="详细描述你的问题，可以拍照上传题目..."
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-ink/30 text-crayon-green focus:ring-crayon-green"
              />
              <span className="text-sm text-ink-light">匿名提问（保护提问安全感）</span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="hand-btn w-full bg-crayon-green text-ink disabled:opacity-50"
            >
              {loading ? "发布中..." : "✅ 发布问题"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
