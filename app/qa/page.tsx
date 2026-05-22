"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

interface Question {
  id: string;
  title: string;
  content: string;
  grade: number | null;
  topic: string | null;
  status: string;
  createdAt: string;
  author: { name: string | null; region: string | null };
  answers: { id: string }[];
}

export default function QAPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/math-young-lecturer/api/questions?status=OPEN")
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold handwritten-title infinity-title" style={{ color: "#3E2723" }}>你问我答</h1>
            <p className="mt-1" style={{ color: "#5D4E44" }}>
              同年级的小伙伴互相帮助，一起解决数学难题
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/qa/ask"
              className="hand-btn hand-btn-yellow"
            >
              🙋 我要提问
            </Link>
            {session?.user && (
              <Link
                href="/qa?filter=my"
                className="hand-btn hand-btn-green"
              >
                🎤 我要讲题
              </Link>
            )}
          </div>
        </div>

        {/* ∞ 分隔线 */}
        <hr className="infinity-divider mb-8" />

        {loading ? (
          <div className="text-center py-12" style={{ color: "#8D7E72" }}>加载中...</div>
        ) : questions.length === 0 ? (
          <div className="sticker sticker-white text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <p className="font-medium" style={{ color: "#3E2723" }}>暂时没有待解答的问题</p>
            <p className="text-sm mt-1" style={{ color: "#8D7E72" }}>你可以成为第一个提问的人！</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/qa/question/${q.id}`}
                className="sticker sticker-white hover:shadow-float transition-shadow block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {q.grade && (
                        <span className="hand-badge hand-badge-green text-xs">
                          {q.grade}年级
                        </span>
                      )}
                      {q.topic && (
                        <span className="hand-badge hand-badge-blue text-xs">
                          {q.topic}
                        </span>
                      )}
                      <span className="hand-badge hand-badge-yellow text-xs">
                        待认领
                      </span>
                    </div>
                    <h3 className="font-bold mb-1" style={{ color: "#3E2723" }}>{q.title}</h3>
                    <p className="text-sm line-clamp-2" style={{ color: "#5D4E44" }}>
                      {q.content}
                    </p>
                    <p className="text-xs mt-2" style={{ color: "#8D7E72" }}>
                      提问人：{q.author.name || "匿名小朋友"} {q.author.region ? `· ${q.author.region}` : ""}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
