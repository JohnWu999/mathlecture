"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

interface HallData {
  topAnswers: {
    id: string;
    videoUrl: string;
    description: string | null;
    createdAt: string;
    lecturer: { name: string | null; grade: number | null };
    question: { title: string; grade: number | null };
  }[];
  solvedQuestions: {
    id: string;
    title: string;
    grade: number | null;
    author: { name: string | null };
    answers: {
      id: string;
      lecturer: { name: string | null };
    }[];
  }[];
}

export default function HallPage() {
  const [data, setData] = useState<HallData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/math-young-lecturer/api/hall")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <div className="inline-block sticker sticker-orange mb-3">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-3xl font-bold handwritten-title infinity-title" style={{ color: "#3E2723" }}>成果广场</h1>
          <p className="mt-2 max-w-lg mx-auto" style={{ color: "#5D4E44" }}>
            看看小讲师们的精彩讲题和解决的难题！
          </p>
        </div>

        {/* ∞ 分隔线 */}
        <hr className="infinity-divider mb-8" />

        {loading ? (
          <div className="text-center py-12" style={{ color: "#8D7E72" }}>加载中...</div>
        ) : (
          <>
            {/* 优秀讲题 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-4" style={{ color: "#3E2723" }}>
                🎤 优秀讲题
              </h2>
              {data?.topAnswers.length === 0 ? (
                <div className="sticker sticker-white text-center py-8">
                  <p style={{ color: "#8D7E72" }}>暂时还没有已采纳的讲题，快来成为第一个吧！</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {data?.topAnswers.map((a) => (
                    <div key={a.id} className="sticker sticker-white">
                      <div className="h-32 bg-crayon-pink/30 flex items-center justify-center rounded-lg mb-3">
                        <span className="text-4xl">🎤</span>
                      </div>
                      <h3 className="font-bold mb-1" style={{ color: "#3E2723" }}>{a.question.title}</h3>
                      <p className="text-xs mb-2" style={{ color: "#8D7E72" }}>
                        讲师：{a.lecturer.name || "小讲师"}
                        {a.lecturer.grade && ` · ${a.lecturer.grade}年级`}
                      </p>
                      {a.videoUrl && (
                        <a
                          href={a.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hand-btn hand-btn-blue text-xs inline-block"
                        >
                          📹 观看视频
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 已解决问题 */}
            <div>
              <h2 className="text-xl font-bold mb-4" style={{ color: "#3E2723" }}>
                ✅ 已解决的问题
              </h2>
              {data?.solvedQuestions.length === 0 ? (
                <div className="sticker sticker-white text-center py-8">
                  <p className="text-ink-light">暂时还没有已解决的问题</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {data?.solvedQuestions.map((q) => (
                    <div key={q.id} className="sticker bg-white flex items-center justify-between">
                      <div>
                        <h3 className="font-bold" style={{ color: "#3E2723" }}>{q.title}</h3>
                        <p className="text-xs" style={{ color: "#8D7E72" }}>
                          提问人：{q.author.name || "小朋友"}
                          {q.grade && ` · ${q.grade}年级`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs hand-badge hand-badge-green">
                          已解决
                        </span>
                        {q.answers[0] && (
                          <p className="text-xs mt-1" style={{ color: "#8D7E72" }}>
                            由 {q.answers[0].lecturer.name || "小讲师"} 讲解
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
