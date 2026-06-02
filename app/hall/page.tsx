"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/navbar";
import {
  OUTCOME_HALL_COPY,
  OUTCOME_TYPES,
  SHARE_AUTHORIZATION_COPY,
  buildOutcomeCard,
  filterPublicOutcomes,
  getOutcomeDetailSections,
  getOutcomeEmptyCopy,
} from "@/lib/outcome-hall-ui-rules.mjs";

interface Outcome {
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
  createdAt?: string;
}

interface HallData {
  outcomes: Outcome[];
  authorizationRule: string;
  rankingEnabled: boolean;
}

export default function HallPage() {
  const [data, setData] = useState<HallData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<"ALL" | "QUESTION" | "LECTURE" | "PROJECT">("ALL");

  useEffect(() => {
    fetch("/math-young-lecturer/api/hall")
      .then((r) => r.json())
      .then((d) => {
        setData({
          outcomes: Array.isArray(d.outcomes) ? d.outcomes : [],
          authorizationRule: d.authorizationRule || SHARE_AUTHORIZATION_COPY,
          rankingEnabled: Boolean(d.rankingEnabled),
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const publicOutcomes = useMemo(() => filterPublicOutcomes(data?.outcomes || []), [data]);
  const visibleOutcomes = activeType === "ALL"
    ? publicOutcomes
    : publicOutcomes.filter((item) => item.type === activeType);
  const detailSections = getOutcomeDetailSections({ type: activeType === "ALL" ? "LECTURE" : activeType });

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto relative z-10">
        <div className="sticker bg-crayon-green/45 text-center mb-8">
          <p className="text-sm text-ink-light">{OUTCOME_HALL_COPY.eyebrow}</p>
          <h1 className="text-3xl font-bold handwritten-title infinity-title text-ink mt-1">{OUTCOME_HALL_COPY.title}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-ink-light leading-relaxed">
            {OUTCOME_HALL_COPY.subtitle}
          </p>
          <p className="mt-2 text-xs text-ink-light">{OUTCOME_HALL_COPY.safetyNote}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {detailSections.map((section) => (
            <div key={section.key} className="sticker bg-white">
              <h2 className="font-bold text-ink text-sm">{section.title}</h2>
              <p className="text-xs text-ink-light leading-relaxed mt-1">{section.description}</p>
            </div>
          ))}
        </div>

        <div className="sticker bg-white mb-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-ink">🌿 选择想看的成果</h2>
              <p className="text-xs text-ink-light mt-1">{data?.authorizationRule || SHARE_AUTHORIZATION_COPY}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveType("ALL")}
                className={`px-3 py-1.5 rounded-full text-sm border ${activeType === "ALL" ? "bg-ink text-paper border-ink" : "bg-parchment border-ink/10 text-ink"}`}
              >全部</button>
              {OUTCOME_TYPES.map((type) => (
                <button
                  key={type.type}
                  type="button"
                  onClick={() => setActiveType(type.type as "QUESTION" | "LECTURE" | "PROJECT")}
                  className={`px-3 py-1.5 rounded-full text-sm border ${activeType === type.type ? "bg-ink text-paper border-ink" : "bg-parchment border-ink/10 text-ink"}`}
                >{type.emoji} {type.label}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载成果森林中...</div>
        ) : visibleOutcomes.length === 0 ? (
          <div className="sticker bg-white text-center py-10">
            <div className="text-4xl mb-3">🌱</div>
            <p className="text-ink-light">{getOutcomeEmptyCopy(activeType === "ALL" ? "LECTURE" : activeType)}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleOutcomes.map((outcome) => {
              const card = buildOutcomeCard(outcome);
              return (
                <article key={card.id} className="sticker bg-white flex flex-col">
                  <div className={`h-36 ${card.coverTone} rounded-2xl mb-3 flex items-center justify-center relative overflow-hidden`}>
                    <span className="text-5xl">{card.emoji}</span>
                    <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-white/80 text-xs font-bold text-ink">{card.typeLabel}</span>
                  </div>
                  <h3 className="font-bold text-ink leading-snug">{card.title}</h3>
                  <p className="text-xs text-ink-light mt-1">{card.childMeta}</p>
                  {outcome.knowledgePoint && (
                    <span className="inline-flex mt-2 w-fit px-2 py-1 rounded-full bg-crayon-yellow/30 text-xs text-ink-light">{outcome.knowledgePoint}</span>
                  )}
                  <p className="text-sm text-ink-light leading-relaxed mt-3 line-clamp-3">{card.childLine}</p>
                  <p className="text-xs text-ink-light leading-relaxed mt-2">{card.teacherLine}</p>
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <span className="text-[11px] px-2 py-1 rounded-full bg-crayon-green/25 text-ink-light">{card.authorizationLabel}</span>
                    {card.href && (
                      <a href={`/math-young-lecturer${card.href}`} className="hand-btn bg-crayon-yellow text-ink text-xs px-3 py-1.5">
                        看详情
                      </a>
                    )}
                    {card.videoUrl && (
                      <a href={card.videoUrl} target="_blank" rel="noopener noreferrer" className="hand-btn bg-crayon-blue text-ink text-xs px-3 py-1.5">
                        看讲解
                      </a>
                    )}
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
