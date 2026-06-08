"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import { getHeatPrompt, getQuestionStatusBadge } from "@/lib/qa-ui-rules.mjs";

interface Question {
  id: string;
  title: string;
  content: string;
  grade: number | null;
  topic: string | null;
  confusionType?: string | null;
  heatCount?: number;
  reviewStatus?: string;
  status: string;
  createdAt: string;
  author: { name: string | null; region: string | null };
  answers: { id: string; status?: string; reviewStatus?: string; shareScope?: string }[];
}

export default function QAPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [listRule, setListRule] = useState("热度只帮助待讲题目排序，不是点赞榜，也不显示排名。");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    fetch("/math-young-lecturer/api/questions?status=OPEN")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(Array.isArray(data) ? data : data.questions || []);
        if (data?.listRule) setListRule(data.listRule);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleHeat = async (questionId: string) => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/qa")}`);
      return;
    }
    try {
      const res = await fetch(`/math-young-lecturer/api/questions/${questionId}/heat`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加热度失败");
      setQuestions((prev) =>
        prev.map((q) => (q.id === questionId ? { ...q, heatCount: data.heatCount } : q))
      );
      setNotice(data.childMessage || "已经帮这道题加了一点热度。");
    } catch (error: any) {
      setNotice(error.message || "加热度失败");
    }
  };

  return (
    <main className="forest-page-shell">
      <Navbar />

      <section className="forest-page-content">
        <div className="forest-page-hero flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="forest-page-eyebrow">🌱 问题种子 → 讲解长高</p>
            <h1 className="forest-page-title handwritten-title infinity-title" style={{ color: "#3E2723" }}>你问我答</h1>
            <p className="forest-page-subtitle" style={{ color: "#5D4E44" }}>
              把一个卡住的地方说出来，让同伴的讲解帮它长成清楚的思路。
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/qa/ask" className="hand-btn hand-btn-yellow">
              🙋 我要提问
            </Link>
            <a href="#claimable" className="hand-btn hand-btn-green">
              🎤 去认领一道题
            </a>
          </div>
        </div>

        <div className="forest-panel">
          <p className="text-sm text-ink font-medium">🌱 温暖提示</p>
          <p className="text-sm text-ink-light mt-1">{listRule}</p>
          <p className="text-xs text-ink-light mt-2">未审核问题不会公开；操作时需要登录，但浏览问题不需要。</p>
        </div>
        {notice && <div className="forest-panel bg-crayon-green/20 text-sm text-ink">{notice}</div>}

        <hr className="infinity-divider mb-8" />

        {loading ? (
          <div className="text-center py-12" style={{ color: "#8D7E72" }}>加载中...</div>
        ) : questions.length === 0 ? (
          <div className="forest-empty">
            <div className="text-4xl mb-3">🌱</div>
            <p className="font-medium" style={{ color: "#3E2723" }}>暂时没有开放认领的问题</p>
            <p className="text-sm mt-1" style={{ color: "#8D7E72" }}>你可以先提出一个好问题，等老师审核后再开放给小讲师。</p>
          </div>
        ) : (
          <div id="claimable" className="forest-card-grid">
            {questions.map((q) => {
              const statusBadge = getQuestionStatusBadge({ status: q.status, reviewStatus: q.reviewStatus || "APPROVED" });
              const heatPrompt = getHeatPrompt({ heatCount: q.heatCount || 0, hasHeated: false });
              return (
                <article key={q.id} className="forest-card block">
                  <Link href={`/qa/question/${q.id}`} className="block">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {q.grade && <span className="hand-badge hand-badge-green text-xs">{q.grade}年级</span>}
                          {q.topic && <span className="hand-badge hand-badge-blue text-xs">{q.topic}</span>}
                          {q.confusionType && <span className="hand-badge hand-badge-yellow text-xs">卡点：{q.confusionType}</span>}
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
                        </div>
                        <h3 className="font-bold mb-1" style={{ color: "#3E2723" }}>{q.title}</h3>
                        <p className="text-sm line-clamp-2" style={{ color: "#5D4E44" }}>{q.content}</p>
                        <p className="text-xs mt-2" style={{ color: "#8D7E72" }}>
                          提问人：{q.author.name || "匿名小朋友"} {q.author.region ? `· ${q.author.region}` : ""}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="mt-3 flex items-center justify-between gap-3 flex-wrap border-t border-ink/10 pt-3">
                    <p className="text-xs text-ink-light max-w-xl">{heatPrompt.helper}</p>
                    <button onClick={() => handleHeat(q.id)} className="hand-btn hand-btn-white text-xs">
                      🔥 {heatPrompt.label}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
