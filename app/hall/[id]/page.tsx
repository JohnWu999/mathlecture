"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/navbar";
import {
  SHARE_AUTHORIZATION_COPY,
  buildOutcomeCard,
  getOutcomeDetailSections,
} from "@/lib/outcome-hall-ui-rules.mjs";

interface OutcomeDetail {
  id: string;
  type: "QUESTION" | "LECTURE" | "PROJECT";
  title: string;
  childName: string;
  grade: number | null;
  knowledgePoint?: string | null;
  childExpression?: string | null;
  teacherNote?: string | null;
  reviewStatus: string;
  shareScope: string;
  videoUrl?: string | null;
  question?: {
    title: string;
    content: string;
    recognizedText?: string | null;
    confusionType?: string | null;
  };
}

export default function OutcomeDetailPage() {
  const { id } = useParams();
  const [outcome, setOutcome] = useState<OutcomeDetail | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/math-young-lecturer/api/hall/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || "获取失败");
        setOutcome(d.outcome);
      })
      .catch((e) => setError(e.message || "获取失败"))
      .finally(() => setLoading(false));
  }, [id]);

  const card = outcome ? buildOutcomeCard(outcome) : null;
  const sections = getOutcomeDetailSections({ type: outcome?.type || "LECTURE" });

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content relative z-10">
        <Link href="/hall" className="text-sm text-ink-light hover:text-ink">← 回到成果广场</Link>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载成果详情中...</div>
        ) : error || !outcome || !card ? (
          <div className="forest-empty bg-white text-center py-10 mt-6">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-ink-light">{error || "成果暂时不可公开查看。"}</p>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            <div className="forest-detail-hero">
              <div className="flex flex-col md:flex-row gap-5 md:items-center">
                <div className={`w-full md:w-56 h-40 ${card.coverTone} rounded-2xl flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-6xl">{card.emoji}</span>
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/80 text-xs font-bold text-ink">{card.typeLabel}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-ink-light">{card.authorizationLabel}</p>
                  <h1 className="text-3xl font-bold handwritten-title text-ink mt-2">{card.title}</h1>
                  <p className="text-sm text-ink-light mt-2">{card.childMeta}</p>
                  {outcome.knowledgePoint && <span className="inline-flex mt-3 px-2 py-1 rounded-full bg-white/75 text-xs text-ink-light">{outcome.knowledgePoint}</span>}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {sections.map((section) => (
                <div key={section.key} className="forest-card">
                  <h2 className="font-bold text-ink text-sm">{section.title}</h2>
                  <p className="text-xs text-ink-light leading-relaxed mt-1">{section.description}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-5">
              <div className="sticker bg-white">
                <h2 className="font-bold text-ink mb-3">🧒 孩子自己的表达</h2>
                <p className="text-ink-light leading-relaxed whitespace-pre-wrap">{card.childLine}</p>
                {card.videoUrl && (
                  <a href={card.videoUrl} target="_blank" rel="noopener noreferrer" className="hand-btn bg-crayon-blue text-ink inline-block mt-4">
                    观看讲解视频
                  </a>
                )}
              </div>
              <div className="sticker bg-white">
                <h2 className="font-bold text-ink mb-3">🌿 老师温暖点评</h2>
                <p className="text-ink-light leading-relaxed">{card.teacherLine}</p>
                <p className="text-xs text-ink-light mt-4">{SHARE_AUTHORIZATION_COPY}</p>
              </div>
            </div>

            {outcome.question && (
              <div className="sticker bg-parchment/80">
                <h2 className="font-bold text-ink mb-2">📌 这份成果来自一个问题</h2>
                <p className="font-medium text-ink">{outcome.question.title}</p>
                <p className="text-sm text-ink-light leading-relaxed mt-2 whitespace-pre-wrap">{outcome.question.recognizedText || outcome.question.content}</p>
                {outcome.question.confusionType && <p className="text-xs text-ink-light mt-2">当时卡住的地方：{outcome.question.confusionType}</p>}
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}
