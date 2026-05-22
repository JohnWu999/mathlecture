"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/navbar";

interface ProfileData {
  user: {
    name: string | null;
    email: string | null;
    grade: number | null;
    region: string | null;
    points: number;
    role: string;
    createdAt: string;
  };
  questions: { id: string; title: string; status: string; createdAt: string }[];
  answers: { id: string; videoUrl: string; status: string; question: { title: string } }[];
  registrations: { id: string; status: string; project: { title: string; status: string } }[];
  badges: { id: string; awardedAt: string; badge: { name: string; description: string; iconUrl: string | null } }[];
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    fetch("/math-young-lecturer/api/user/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      });
  }, [session]);

  if (!session?.user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-ink-light mb-4">请先登录查看个人中心</p>
          <Link href="/login" className="hand-btn bg-crayon-green text-ink">
            去登录
          </Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">加载中...</div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">获取失败</div>
      </main>
    );
  }

  const { user, questions, answers, registrations, badges } = profile;

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-3xl mx-auto">
        {/* 用户卡片 */}
        <div className="sticker bg-crayon-yellow text-center mb-6">
          <div className="text-5xl mb-2">👤</div>
          <h1 className="text-xl font-bold text-ink">{user.name || "小朋友"}</h1>
          <div className="flex justify-center gap-3 mt-3 flex-wrap">
            {user.grade && (
              <span className="px-3 py-1 bg-white/70 rounded-full text-sm">
                {user.grade}年级
              </span>
            )}
            {user.region && (
              <span className="px-3 py-1 bg-white/70 rounded-full text-sm">
                {user.region}
              </span>
            )}
            <span className="px-3 py-1 bg-crayon-orange/30 rounded-full text-sm font-medium">
              ⚡ {user.points} 积分
            </span>
          </div>
        </div>

        {/* 徽章墙 */}
        <div className="mb-6">
          <h2 className="font-bold text-ink mb-3">🏆 我的徽章</h2>
          {badges.length === 0 ? (
            <div className="sticker bg-white text-center py-6">
              <p className="text-ink-light text-sm">还没有徽章，快去讲题和参加项目吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {badges.map((b) => (
                <div key={b.id} className="sticker bg-white text-center py-4">
                  <div className="text-3xl mb-1">{b.badge.iconUrl || "🎯"}</div>
                  <p className="text-xs font-medium text-ink">{b.badge.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 我的提问 */}
        <div className="mb-6">
          <h2 className="font-bold text-ink mb-3">🙋 我的提问</h2>
          {questions.length === 0 ? (
            <div className="sticker bg-white text-center py-4 text-sm text-ink-light">还没有提问</div>
          ) : (
            <div className="space-y-2">
              {questions.map((q) => (
                <Link key={q.id} href={`/qa/question/${q.id}`} className="sticker bg-white block hover:shadow-float transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink truncate flex-1">{q.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${q.status === "RESOLVED" ? "bg-crayon-green/30" : "bg-crayon-yellow/30"}`}>
                      {q.status === "RESOLVED" ? "已解决" : "待解答"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 我的讲题 */}
        <div className="mb-6">
          <h2 className="font-bold text-ink mb-3">🎤 我的讲题</h2>
          {answers.length === 0 ? (
            <div className="sticker bg-white text-center py-4 text-sm text-ink-light">还没有讲题视频</div>
          ) : (
            <div className="space-y-2">
              {answers.map((a) => (
                <div key={a.id} className="sticker bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink truncate flex-1">{a.question.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 ${a.status === "APPROVED" ? "bg-crayon-green/30" : "bg-crayon-yellow/30"}`}>
                      {a.status === "APPROVED" ? "已采纳" : "待审核"}
                    </span>
                  </div>
                  {a.videoUrl && (
                    <a href={a.videoUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-crayon-blue hover:underline mt-1 block">
                      📹 观看视频
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 我的项目 */}
        <div className="mb-6">
          <h2 className="font-bold text-ink mb-3">🎯 我的项目</h2>
          {registrations.length === 0 ? (
            <div className="sticker bg-white text-center py-4 text-sm text-ink-light">还没有报名项目</div>
          ) : (
            <div className="space-y-2">
              {registrations.map((r) => (
                <div key={r.id} className="sticker bg-white">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-ink">{r.project.title}</span>
                    <span className="text-xs px-2 py-0.5 bg-crayon-green/30 rounded-full">
                      {r.status === "CONFIRMED" ? "已确认" : r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
