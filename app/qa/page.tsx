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

      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink">你问我答</h1>
            <p className="text-ink-light mt-1">
              同年级的小伙伴互相帮助，一起解决数学难题
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/qa/ask"
              className="hand-btn bg-crayon-yellow text-ink"
            >
              🙋 我要提问
            </Link>
            {session?.user && (
              <Link
                href="/qa?filter=my"
                className="hand-btn bg-crayon-green text-ink"
              >
                🎤 我要讲题
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载中...</div>
        ) : questions.length === 0 ? (
          <div className="sticker bg-white text-center py-12">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-ink font-medium">暂时没有待解答的问题</p>
            <p className="text-ink-light text-sm mt-1">你可以成为第一个提问的人！</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/qa/question/${q.id}`}
                className="sticker bg-white hover:shadow-float transition-shadow block"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {q.grade && (
                        <span className="px-2 py-0.5 bg-crayon-green/20 rounded-full text-xs font-medium">
                          {q.grade}年级
                        </span>
                      )}
                      {q.topic && (
                        <span className="px-2 py-0.5 bg-crayon-blue/20 rounded-full text-xs font-medium">
                          {q.topic}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-crayon-yellow/30 rounded-full text-xs font-medium">
                        待认领
                      </span>
                    </div>
                    <h3 className="font-bold text-ink mb-1">{q.title}</h3>
                    <p className="text-sm text-ink-light line-clamp-2">
                      {q.content}
                    </p>
                    <p className="text-xs text-ink-light mt-2">
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
