"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface ProjectDetail {
  id: string;
  title: string;
  description: string;
  price: number;
  durationDays: number;
  coverImage: string | null;
  status: string;
  _count: { registrations: number; groups: number };
  groups: {
    id: string;
    name: string;
    dayProgress: number;
    _count: { members: number };
  }[];
}

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetch(`/math-young-lecturer/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setLoading(false);
      });
  }, [id]);

  const handleRegister = async () => {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setRegistering(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/projects/${id}/register`, {
        method: "POST",
      });
      if (res.ok) {
        alert("🎉 报名成功！请等待老师分配小组。");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "报名失败");
      }
    } catch (e) {
      alert("报名失败");
    }
    setRegistering(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">加载中...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">项目不存在</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-3xl mx-auto">
        {/* 项目头部 */}
        <div className="sticker bg-crayon-yellow text-center mb-6">
          <div className="text-5xl mb-3">🎯</div>
          <h1 className="text-2xl font-bold text-ink">{project.title}</h1>
          <div className="flex justify-center gap-3 mt-3">
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm">
              {project.durationDays}天核心课程
            </span>
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm">
              {project._count.registrations}人已报名
            </span>
          </div>
        </div>

        {/* 项目介绍 */}
        <div className="sticker bg-white mb-6">
          <h2 className="font-bold text-ink mb-3">📝 项目介绍</h2>
          <p className="text-ink-light leading-relaxed whitespace-pre-wrap">
            {project.description}
          </p>
        </div>

        {/* 报名按钮 */}
        <div className="sticker bg-crayon-green text-center mb-6">
          <p className="text-ink font-medium mb-2">
            报名费：¥{project.price / 100}
          </p>
          <button
            onClick={handleRegister}
            disabled={registering}
            className="hand-btn bg-white text-ink disabled:opacity-50"
          >
            {registering ? "报名中..." : "🎉 立即报名"}
          </button>
          <p className="text-xs text-ink-light mt-2">
            MVP阶段免费体验，无需支付
          </p>
        </div>

        {/* 小组列表 */}
        {project.groups.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-ink mb-3">👥 项目小组</h2>
            <div className="grid gap-3">
              {project.groups.map((g) => (
                <div key={g.id} className="sticker bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink">{g.name}</h4>
                    <p className="text-xs text-ink-light">
                      Day {g.dayProgress} / {project.durationDays} · {g._count.members}人
                    </p>
                  </div>
                  <Link
                    href={`/groups/${g.id}`}
                    className="hand-btn text-xs bg-crayon-blue text-ink"
                  >
                    进入空间
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
