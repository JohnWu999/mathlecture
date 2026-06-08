"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { PUBLIC_PROFILE_HREF } from "@/lib/public-entry-hrefs.mjs";
import {
  PROJECT_CAMP_COPY,
  formatProjectValidity,
  getProjectReadiness,
  getProjectTeamStatus,
  getProjectTypeLabel,
} from "@/lib/project-camp-ui-rules.mjs";

interface Project {
  id: string;
  title: string;
  description: string;
  price: number;
  projectType: "FREE" | "PAID";
  knowledgeTags: string[];
  unlockRule: string | null;
  groupSizeMin: number;
  groupSizeMax: number;
  validUntil: string | null;
  durationDays: number;
  coverImage: string | null;
  _count: { registrations: number; groups: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/math-young-lecturer/api/projects")
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content">
        <div className="forest-page-hero text-center">
          <span className="forest-v2-icon forest-icon-grove mb-3" aria-hidden="true" />
          <h1 className="forest-page-title handwritten-title infinity-title">森林任务 · {PROJECT_CAMP_COPY.title}</h1>
          <p className="mt-2 max-w-2xl mx-auto text-ink-light leading-relaxed">
            {PROJECT_CAMP_COPY.subtitle}
          </p>
          <p className="mt-3 max-w-3xl mx-auto text-sm text-ink-light">
            {PROJECT_CAMP_COPY.intro} 让项目成林，而不是把项目做成课程货架。
          </p>
        </div>

        <div className="forest-info-card flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div>
            <p className="font-bold text-ink">项目卡怎么看？</p>
            <p className="text-sm text-ink-light mt-1">{PROJECT_CAMP_COPY.safetyNote}</p>
          </div>
          <a href={PUBLIC_PROFILE_HREF} className="hand-btn bg-crayon-green text-ink text-center">
            查看我的成长护照
          </a>
        </div>

        <hr className="infinity-divider mb-8" />

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载项目森林中...</div>
        ) : projects.length === 0 ? (
          <div className="forest-empty">
            <span className="forest-v2-icon forest-icon-grove mb-3" aria-hidden="true" />
            <p className="font-medium text-ink">暂时没有开放的项目</p>
            <p className="text-sm mt-1 text-ink-light">{PROJECT_CAMP_COPY.empty}</p>
          </div>
        ) : (
          <div className="forest-card-grid two">
            {projects.map((p) => {
              const type = getProjectTypeLabel(p.projectType);
              const readiness = getProjectReadiness(p);
              const team = getProjectTeamStatus({
                registrations: p._count.registrations,
                groups: p._count.groups,
                groupSizeMin: p.groupSizeMin,
                groupSizeMax: p.groupSizeMax,
              });
              return (
                <Link
                  key={p.id}
                  href={`/projects/${p.id}`}
                  className="forest-card block overflow-hidden"
                >
                  <div className="h-40 bg-crayon-yellow/30 flex items-center justify-center relative">
                    {p.coverImage ? (
                      <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="forest-cover-glyph forest-cover-project" aria-hidden="true" />
                    )}
                    <span className={`absolute left-4 top-4 hand-badge ${type.badgeClass} text-xs`}>
                      {type.label}
                    </span>
                  </div>
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold mb-2 text-ink">{p.title}</h3>
                      <p className="text-sm line-clamp-2 text-ink-light">{p.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="hand-badge hand-badge-blue text-xs">{p.durationDays}天探索</span>
                      <span className="hand-badge hand-badge-green text-xs">{team.label}</span>
                      <span className="hand-badge hand-badge-yellow text-xs">{formatProjectValidity(p.validUntil)}</span>
                    </div>

                    <div className="forest-note-card">
                      <p className="text-xs font-bold text-ink mb-1">{readiness.title}</p>
                      <p className="text-xs text-ink-light leading-relaxed">{readiness.summary}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {readiness.tags.map((tag) => (
                          <span key={tag} className="text-[11px] px-2 py-1 rounded-full bg-white/80 text-ink-light">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ink-light">{type.helper}</span>
                      <span className="font-bold text-crayon-orange whitespace-nowrap">
                        {p.projectType === "FREE" || p.price === 0 ? "免费体验" : "主题服务"}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
