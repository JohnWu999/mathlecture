"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface Project {
  id: string;
  title: string;
  description: string;
  price: number;
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
        setProjects(data);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-block sticker bg-crayon-yellow mb-3">
            <span className="text-3xl">🎯</span>
          </div>
          <h1 className="text-3xl font-bold text-ink">PBL 项目营</h1>
          <p className="text-ink-light mt-2 max-w-lg mx-auto">
            以真实问题为驱动，小伙伴们一起探索、合作、解决问题！
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载中...</div>
        ) : projects.length === 0 ? (
          <div className="sticker bg-white text-center py-12">
            <div className="text-4xl mb-3">🛣️</div>
            <p className="text-ink font-medium">暂时没有开放的项目</p>
            <p className="text-ink-light text-sm mt-1">敬请期待第一期项目上线！</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="sticker bg-white hover:shadow-float transition-shadow block overflow-hidden"
              >
                <div className="h-40 bg-crayon-yellow/30 flex items-center justify-center">
                  {p.coverImage ? (
                    <img src={p.coverImage} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl">🎯</span>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-crayon-blue/20 rounded-full text-xs font-medium">
                      {p.durationDays}天
                    </span>
                    <span className="px-2 py-0.5 bg-crayon-green/20 rounded-full text-xs font-medium">
                      {p._count.groups}个小组
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink mb-2">{p.title}</h3>
                  <p className="text-sm text-ink-light line-clamp-2 mb-3">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink-light">
                      {p._count.registrations}人已报名
                    </span>
                    <span className="font-bold text-crayon-orange">
                      ¥{p.price / 100}
                    </span>
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
