"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  GROWTH_ENERGY_SOURCES,
  GROWTH_ENERGY_USES,
  IDENTITY_PASSPORTS,
  formatGrowthEnergyTransaction,
  getGrowthEnergyCopy,
  getIdentityPassportCard,
  getPassportSafetyCopy,
} from "@/lib/growth-passport-ui-rules.mjs";

interface GrowthEnergyTransaction {
  id: string;
  amount: number;
  reason: string;
  displayLabel?: string | null;
  userMessage?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  affectsIdentityLevel?: boolean;
  createdAt: string;
}

interface IdentityProgressItem {
  identityType: "QUESTIONER" | "LECTURER" | "EXPLORER";
  effectiveCount: number;
  qualityCount: number;
  level: number;
  updatedAt: string;
}

interface ProfileData {
  user: {
    id?: string;
    name: string | null;
    phone: string;
    grade: number | null;
    region: string | null;
    points: number;
    growthEnergy?: number;
    questionerLevel?: number;
    lecturerLevel?: number;
    explorerLevel?: number;
    learnerIntro?: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  questions: { id: string; title: string; status: string; createdAt: string }[];
  answers: { id: string; videoUrl: string; status: string; question: { title: string } }[];
  registrations: { id: string; status: string; project: { title: string; status: string } }[];
  badges: { id: string; awardedAt: string; badge: { name: string; description: string; iconUrl: string | null } }[];
  growthEnergy?: {
    total: number;
    rankingEnabled: boolean;
    childExplanation: string;
    parentExplanation: string;
    recentTransactions: GrowthEnergyTransaction[];
  };
  identityProgress?: IdentityProgressItem[];
  projectAccesses?: { id: string; packageType: string; status: string; quotaTotal?: number | null; quotaUsed?: number | null; validUntil?: string | null; note?: string | null; project?: { title: string } | null }[];
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
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (!session?.user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-ink-light mb-4">请先登录查看个人中心</p>
          <Link href="/login" className="hand-btn hand-btn-green">去登录</Link>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="min-h-screen"><Navbar /><div className="text-center py-20 text-ink-light">加载中...</div></main>;
  }

  if (!profile) {
    return <main className="min-h-screen"><Navbar /><div className="text-center py-20 text-ink-light">获取失败</div></main>;
  }

  const { user, questions, answers, registrations, badges } = profile;
  const totalGrowthEnergy = profile.growthEnergy?.total ?? user.growthEnergy ?? user.points ?? 0;
  const energyCopy = getGrowthEnergyCopy(totalGrowthEnergy);
  const safetyCopy = getPassportSafetyCopy();

  const identityCards = IDENTITY_PASSPORTS.map((identity) => {
    const progressMap = new Map((profile.identityProgress || []).map((item) => [item.identityType, item]));
    const fallbackLevel = identity.type === "QUESTIONER" ? user.questionerLevel : identity.type === "LECTURER" ? user.lecturerLevel : user.explorerLevel;
    return getIdentityPassportCard(
      progressMap.get(identity.type) || {
        identityType: identity.type,
        level: fallbackLevel || 0,
        effectiveCount: 0,
        qualityCount: 0,
      }
    );
  });

  const recentTransactions = profile.growthEnergy?.recentTransactions || [];
  const projectAccesses = profile.projectAccesses || [];
  const packageLabel = (type: string) => ({
    BASIC_EXPERIENCE: "基础体验项目",
    FIVE_SESSION_PACK: "5 次项目包",
    TWENTY_WEEK_PACK: "20 周项目包",
    SPECIFIC_PROJECT: "指定项目权限",
    PAUSE_PROJECT_ACCESS: "暂停项目权限",
  } as Record<string, string>)[type] || type;

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-5xl mx-auto">
        <div className="sticker sticker-yellow mb-6 overflow-hidden relative">
          <div className="absolute -right-8 -top-10 text-8xl opacity-20">∞</div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/70 border-2 border-ink/10 flex items-center justify-center text-4xl shadow-soft">👤</div>
              <div>
                <p className="text-sm text-ink-light">我的成长护照</p>
                <h1 className="text-2xl font-bold text-ink handwritten-title">{user.name || "小朋友"}</h1>
                <p className="text-sm text-ink-light mt-1">{user.learnerIntro || "会思考，爱数学。慢慢讲，我们听得见。"}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {user.grade && <span className="hand-badge hand-badge-white text-xs">{user.grade}年级</span>}
                  {user.region && <span className="hand-badge hand-badge-white text-xs">{user.region}</span>}
                  {!user.isActive && <span className="hand-badge hand-badge-pink text-xs">⏳ 待老师开放权限</span>}
                </div>
              </div>
            </div>
            <div className="sticker bg-white/80 text-center min-w-[190px]">
              <p className="text-xs text-ink-light">{energyCopy.title}</p>
              <p className="text-4xl font-bold text-ink handwritten-title my-1">{totalGrowthEnergy}</p>
              <p className="text-xs text-ink-light">只在成长护照里私密查看</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6 mb-6">
          <section className="sticker sticker-white">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-bold text-ink text-lg">⚡ {energyCopy.title}</h2>
                <p className="text-sm text-ink-light mt-1">{energyCopy.current}</p>
              </div>
              <span className="hand-badge hand-badge-green text-xs">私密记录</span>
            </div>
            <p className="text-sm text-ink-light leading-relaxed mb-4">{energyCopy.subtitle}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-crayon-green/15 p-4 border border-ink/5">
                <h3 className="text-sm font-bold text-ink mb-2">成长能量从哪里来</h3>
                <ul className="space-y-2">
                  {GROWTH_ENERGY_SOURCES.map((item) => <li key={item} className="text-xs text-ink-light leading-relaxed">🌿 {item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl bg-crayon-blue/15 p-4 border border-ink/5">
                <h3 className="text-sm font-bold text-ink mb-2">成长能量有什么用</h3>
                <ul className="space-y-2">
                  {GROWTH_ENERGY_USES.map((item) => <li key={item} className="text-xs text-ink-light leading-relaxed">✨ {item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="sticker bg-crayon-yellow/30">
            <h2 className="font-bold text-ink mb-3">🧭 给孩子和家长看的说明</h2>
            <div className="space-y-3 text-sm text-ink-light leading-relaxed">
              <p><strong className="text-ink">孩子：</strong>{safetyCopy.child}</p>
              <p><strong className="text-ink">家长：</strong>{safetyCopy.parent}</p>
              <p><strong className="text-ink">老师：</strong>{safetyCopy.teacher}</p>
            </div>
          </section>
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-ink text-lg">🌲 三棵成长小树</h2>
            <p className="text-xs text-ink-light">星级来自有效行为与老师审核，不是积分兑换。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {identityCards.map((card) => (
              <div key={card.type} className={`sticker ${card.colorClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-4xl">{card.icon}</div>
                  <div className="text-lg tracking-widest text-ink">{card.stars}</div>
                </div>
                <h3 className="font-bold text-ink">{card.label}</h3>
                <p className="text-xs text-ink-light mt-1 leading-relaxed">{card.description}</p>
                <div className="mt-3 rounded-xl bg-white/60 p-3 text-xs text-ink-light space-y-1">
                  <p>{card.statusText}</p>
                  <p>有效行为：{card.effectiveCount} 次 · 质量记录：{card.qualityCount} 次</p>
                  <p>{card.nextStep}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-[1fr_1fr] gap-6 mb-6">
          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-3">📒 最近成长能量记录</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">🌱</div>
                <p className="text-sm text-ink-light">还没有成长能量记录。提出一个清楚的问题，就是很好的开始。</p>
                <Link href="/qa/ask" className="hand-btn hand-btn-green text-xs mt-4 inline-block">去提出一个问题</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => {
                  const item = formatGrowthEnergyTransaction(tx);
                  return (
                    <div key={tx.id} className="rounded-2xl bg-paper border border-ink/5 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-ink">{item.title}</p>
                          <p className="text-xs text-ink-light mt-1">{item.message}</p>
                          <p className="text-[11px] text-ink-light mt-1">{item.identityNote}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-crayon-green">{item.amountLabel}</p>
                          <p className="text-[11px] text-ink-light">{item.dateLabel}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-3">🏅 能力徽章</h2>
            {badges.length === 0 ? (
              <div className="text-center py-8 text-sm text-ink-light">
                <div className="text-4xl mb-2">🪐</div>
                <p>能力徽章会由老师观察标签慢慢点亮，不靠刷成长能量。</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {badges.map((b) => (
                  <div key={b.id} className="rounded-2xl bg-paper border border-ink/5 text-center py-4 px-2">
                    <div className="text-3xl mb-1">{b.badge.iconUrl || "🎯"}</div>
                    <p className="text-xs font-medium text-ink">{b.badge.name}</p>
                    <p className="text-[11px] text-ink-light mt-1 line-clamp-2">{b.badge.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="grid md:grid-cols-4 gap-4">
          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-3">🙋 我的提问</h2>
            {questions.length === 0 ? <p className="text-sm text-ink-light">还没有提问</p> : questions.slice(0, 5).map((q) => (
              <Link key={q.id} href={`/qa/question/${q.id}`} className="block text-sm text-ink-light hover:text-ink mb-2 truncate">🌱 {q.title}</Link>
            ))}
          </div>
          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-3">🎤 我的小讲师视频</h2>
            {answers.length === 0 ? <p className="text-sm text-ink-light">还没有讲题视频</p> : answers.slice(0, 5).map((a) => (
              <div key={a.id} className="text-sm text-ink-light mb-2 truncate">🎤 {a.question.title}</div>
            ))}
          </div>
          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-3">🎯 我的项目与作品</h2>
            {registrations.length === 0 ? <p className="text-sm text-ink-light">还没有报名项目</p> : registrations.slice(0, 5).map((r) => (
              <div key={r.id} className="text-sm text-ink-light mb-2 truncate">🌳 {r.project.title}</div>
            ))}
          </div>
          <div className="sticker sticker-yellow">
            <h2 className="font-bold text-ink mb-3">🎟️ 我的项目权限</h2>
            {projectAccesses.length === 0 ? <p className="text-sm text-ink-light">还没有项目包记录。开通由管理员后台登记，老师不处理付费权益。</p> : projectAccesses.slice(0, 5).map((access) => (
              <div key={access.id} className="rounded-xl bg-white/70 border border-ink/5 p-3 mb-2 text-xs text-ink-light">
                <p className="font-bold text-ink">{packageLabel(access.packageType)} · {access.status}</p>
                <p>次数：{access.quotaTotal == null ? "按周期/不限次" : `${access.quotaUsed || 0}/${access.quotaTotal}`}</p>
                {access.project?.title && <p>项目：{access.project.title}</p>}
                {access.validUntil && <p>有效至：{new Date(access.validUntil).toLocaleDateString()}</p>}
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
