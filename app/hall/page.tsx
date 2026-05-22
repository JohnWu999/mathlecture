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
      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block sticker bg-crayon-orange mb-3">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-3xl font-bold text-ink">成果广场</h1>
          <p className="text-ink-light mt-2 max-w-lg mx-auto">
            看看小讲师们的精彩讲题和解决的难题！
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载中...</div>
        ) : (
          <>
            {/* 优秀讲题 */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-ink mb-4">
                🎤 优秀讲题
              </h2>
              {data?.topAnswers.length === 0 ? (
                <div className="sticker bg-white text-center py-8">
                  <p className="text-ink-light">暂时还没有已采纳的讲题，快来成为第一个吧！</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {data?.topAnswers.map((a) => (
                    <div key={a.id} className="sticker bg-white">
                      <div className="h-32 bg-crayon-pink/30 flex items-center justify-center rounded-lg mb-3">
                        <span className="text-4xl">🎤</span>
                      </div>
                      <h3 className="font-bold text-ink mb-1">{a.question.title}</h3>
                      <p className="text-xs text-ink-light mb-2">
                        讲师：{a.lecturer.name || "小讲师"}
                        {a.lecturer.grade && ` · ${a.lecturer.grade}年级`}
                      </p>
                      {a.videoUrl && (
                        <a
                          href={a.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hand-btn text-xs bg-crayon-blue text-ink inline-block"
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
              <h2 className="text-xl font-bold text-ink mb-4">
                ✅ 已解决的问题
              </h2>
              {data?.solvedQuestions.length === 0 ? (
                <div className="sticker bg-white text-center py-8">
                  <p className="text-ink-light">暂时还没有已解决的问题</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {data?.solvedQuestions.map((q) => (
                    <div key={q.id} className="sticker bg-white flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-ink">{q.title}</h3>
                        <p className="text-xs text-ink-light">
                          提问人：{q.author.name || "小朋友"}
                          {q.grade && ` · ${q.grade}年级`}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs px-2 py-1 bg-crayon-green/30 rounded-full">
                          已解决
                        </span>
                        {q.answers[0] && (
                          <p className="text-xs text-ink-light mt-1">
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
