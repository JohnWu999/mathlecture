"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
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
import { getLearnerProjectAccessCopy } from "@/lib/project-access-linkage-rules.mjs";

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
    avatar?: string | null;
    role: string;
    isActive: boolean;
    createdAt: string;
  };
  questions: { id: string; title: string; status: string; createdAt: string }[];
  answers: { id: string; videoUrl: string; status: string; question?: { title: string } | null }[];
  registrations: { id: string; status: string; project?: { title: string; status: string } | null }[];
  badges: { id: string; awardedAt: string; badge: { name: string; description: string; iconUrl: string | null } }[];
  growthEnergy?: {
    total: number;
    rankingEnabled: boolean;
    childExplanation: string;
    parentExplanation: string;
    recentTransactions: GrowthEnergyTransaction[];
  };
  identityProgress?: IdentityProgressItem[];
  projectAccesses?: { id: string; packageType: string; status: string; quotaTotal?: number | null; quotaUsed?: number | null; validUntil?: string | null; note?: string | null; project?: { id?: string; title: string } | null }[];
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status !== "authenticated" || !session?.user) {
      setProfile(null);
      setProfileError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setProfileError(null);
    fetch("/math-young-lecturer/api/user/profile")
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(typeof data?.error === "string" ? data.error : "个人中心资料暂时读取失败");
        }
        return data;
      })
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch((error) => {
        setProfileError(error instanceof Error ? error.message : "个人中心资料暂时读取失败");
        setProfile(null);
        setLoading(false);
      });
  }, [session, status]);

  const handleAvatarUpload = async (file?: File | null) => {
    if (!file) return;
    setAvatarUploading(true);
    setAvatarNotice(null);
    try {
      const form = new FormData();
      form.append("kind", "avatar");
      form.append("file", file);
      const uploadRes = await fetch("/math-young-lecturer/api/uploads", { method: "POST", body: form });
      const uploadData = await uploadRes.json().catch(() => ({}));
      if (!uploadRes.ok) throw new Error(uploadData.error || "头像上传失败");
      const saveRes = await fetch("/math-young-lecturer/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: uploadData.url }),
      });
      const saveData = await saveRes.json().catch(() => ({}));
      if (!saveRes.ok) throw new Error(saveData.error || "头像保存失败");
      setProfile((prev) => prev ? { ...prev, user: { ...prev.user, avatar: saveData.user?.avatar || uploadData.url } } : prev);
      setAvatarNotice(saveData.message || "头像已更新");
    } catch (error: any) {
      setAvatarNotice(error.message || "头像上传失败");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (status === "loading") {
    return <main className="forest-page-shell"><Navbar /><div className="text-center py-20 text-ink-light">正在确认登录状态...</div></main>;
  }

  if (status !== "authenticated" || !session?.user) {
    return (
      <main className="forest-page-shell">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-ink-light mb-4">请先登录查看个人中心</p>
          <Link href="/login" className="hand-btn hand-btn-green">去登录</Link>
        </div>
      </main>
    );
  }

  if (session.user.role !== "STUDENT") {
    return (
      <main className="forest-page-shell">
        <Navbar />
        <div className="text-center py-20">
          <span className="forest-v2-icon forest-icon-note mb-3" aria-hidden="true" />
          <p className="text-ink font-medium">该页面只对学习者账号开放</p>
          <p className="text-ink-light text-sm mt-1">老师和管理员请使用各自工作台；如需切换身份，请退出后登录对应账号。</p>
        </div>
      </main>
    );
  }

  if (loading) {
    return <main className="forest-page-shell"><Navbar /><div className="text-center py-20 text-ink-light">加载中...</div></main>;
  }

  if (!profile) {
    return (
      <main className="forest-page-shell">
        <Navbar />
        <section className="forest-page-content">
          <div className="forest-empty">
            <span className="forest-v2-icon forest-icon-passport mb-3" aria-hidden="true" />
            <p className="font-medium text-ink">个人中心暂时没有取到完整资料</p>
            <p className="text-sm mt-1 text-ink-light">{profileError || "请稍后刷新重试；如果刚刚完成注册或权限调整，老师后台会继续核对。"}</p>
            <Link href="/projects" className="hand-btn hand-btn-green text-xs mt-4 inline-block">先回项目营</Link>
          </div>
        </section>
      </main>
    );
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

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content">
        <div className="forest-page-hero overflow-hidden relative">
          <div className="absolute -right-8 -top-10 text-8xl opacity-20">∞</div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-center">
                {user.avatar ? <img src={user.avatar} alt="学习者头像" className="w-20 h-20 rounded-3xl object-cover bg-white border border-ink/10" /> : <span className="forest-v2-icon forest-icon-passport !w-20 !h-20" aria-hidden="true" />}
                <label className="mt-2 inline-flex cursor-pointer text-[11px] text-crayon-blue underline">
                  {avatarUploading ? "上传中..." : "上传头像"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" disabled={avatarUploading} onChange={(e) => handleAvatarUpload(e.target.files?.[0])} />
                </label>
                {avatarNotice && <p className="mt-1 max-w-[110px] text-[11px] text-ink-light">{avatarNotice}</p>}
              </div>
              <div>
                <p className="forest-page-eyebrow">成长护照 · 我的成长护照</p>
                <h1 className="forest-page-title handwritten-title">{user.name || "小朋友"}</h1>
                <p className="text-sm text-ink-light mt-1">{user.learnerIntro || "会思考，爱数学。慢慢讲，我们听得见。"}</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {user.grade && <span className="hand-badge hand-badge-white text-xs">{user.grade}年级</span>}
                  {user.region && <span className="hand-badge hand-badge-white text-xs">{user.region}</span>}
                  {!user.isActive && <span className="hand-badge hand-badge-pink text-xs">待老师开放权限</span>}
                </div>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/math-young-lecturer/login" })}
                  className="hand-btn hand-btn-white text-xs mt-4 inline-flex"
                >退出登录</button>
              </div>
            </div>
            <div className="forest-info-card bg-white/80 text-center min-w-[190px]">
              <p className="text-xs text-ink-light">{energyCopy.title}</p>
              <p className="text-4xl font-bold text-ink handwritten-title my-1">{totalGrowthEnergy}</p>
              <p className="text-xs text-ink-light">只在成长护照里私密查看，不排名</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.4fr_0.9fr] gap-6 mb-6">
          <section className="forest-info-card">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-bold text-ink text-lg">{energyCopy.title}</h2>
                <p className="text-sm text-ink-light mt-1">{energyCopy.current}</p>
              </div>
              <span className="hand-badge hand-badge-green text-xs">私密记录</span>
            </div>
            <p className="text-sm text-ink-light leading-relaxed mb-4">{energyCopy.subtitle}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-crayon-green/15 p-4 border border-ink/5">
                <h3 className="text-sm font-bold text-ink mb-2">成长能量从哪里来</h3>
                <ul className="space-y-2">
                  {GROWTH_ENERGY_SOURCES.map((item) => <li key={item} className="text-xs text-ink-light leading-relaxed">{item}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl bg-crayon-blue/15 p-4 border border-ink/5">
                <h3 className="text-sm font-bold text-ink mb-2">成长能量有什么用</h3>
                <ul className="space-y-2">
                  {GROWTH_ENERGY_USES.map((item) => <li key={item} className="text-xs text-ink-light leading-relaxed">{item}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="forest-note-card bg-crayon-yellow/30">
            <h2 className="font-bold text-ink mb-3">成长护照说明</h2>
            <div className="space-y-2 text-sm text-ink-light leading-relaxed">
              <p>{safetyCopy.child}</p>
              <p>{safetyCopy.parent}</p>
            </div>
          </section>
        </div>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-ink text-lg">三棵成长小树</h2>
            <p className="text-xs text-ink-light">星级来自有效行为与老师审核，不是积分兑换。</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {identityCards.map((card) => (
              <div key={card.type} className={`forest-card ${card.colorClass}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`forest-v2-icon ${card.iconClass} !w-14 !h-14`} aria-hidden="true" />
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
          <div className="forest-panel">
            <h2 className="font-bold text-ink mb-3">最近成长能量记录</h2>
            {recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <span className="forest-v2-icon forest-icon-seed mb-2" aria-hidden="true" />
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

          <div className="forest-panel">
            <h2 className="font-bold text-ink mb-3">能力徽章</h2>
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
          <div className="forest-panel">
            <h2 className="font-bold text-ink mb-3">我的提问</h2>
            {questions.length === 0 ? <p className="text-sm text-ink-light">还没有提问</p> : questions.slice(0, 5).map((q) => (
              <Link key={q.id} href={`/qa/question/${q.id}`} className="block text-sm text-ink-light hover:text-ink mb-2 truncate">{q.title}</Link>
            ))}
          </div>
          <div className="forest-panel">
            <h2 className="font-bold text-ink mb-3">我的小讲师视频</h2>
            {answers.length === 0 ? <p className="text-sm text-ink-light">还没有讲题视频</p> : answers.slice(0, 5).map((a) => (
              <div key={a.id} className="text-sm text-ink-light mb-2 truncate">{a.question?.title || "讲题记录待补全"}</div>
            ))}
          </div>
          <div className="forest-panel">
            <h2 className="font-bold text-ink mb-3">我的项目与作品</h2>
            {registrations.length === 0 ? <p className="text-sm text-ink-light">还没有报名项目</p> : registrations.slice(0, 5).map((r) => (
              <div key={r.id} className="text-sm text-ink-light mb-2 truncate">{r.project?.title || "项目记录待补全"}</div>
            ))}
          </div>
          <div className="forest-note-card">
            <h2 className="font-bold text-ink mb-3">我的项目权限</h2>
            {projectAccesses.length === 0 ? <p className="text-sm text-ink-light">还没有项目包记录。开通由管理员后台登记，老师不处理付费权益。</p> : projectAccesses.slice(0, 5).map((access) => {
              const copy = getLearnerProjectAccessCopy({ packageType: access.packageType, status: access.status, projectTitle: access.project?.title || "项目营" });
              return (
                <div key={access.id} className="rounded-xl bg-white/70 border border-ink/5 p-3 mb-2 text-xs text-ink-light">
                  <p className="font-bold text-ink">{copy.title} · {copy.statusLabel}</p>
                  <p>{copy.helper}</p>
                  <p>次数：{access.quotaTotal == null ? "按周期/不限次" : `${access.quotaUsed || 0}/${access.quotaTotal}`}</p>
                  {access.validUntil && <p>有效至：{new Date(access.validUntil).toLocaleDateString()}</p>}
                  {access.status === "ACTIVE" && access.project?.id && <Link href={`/projects/${access.project.id}`} className="inline-block mt-2 text-crayon-blue font-bold">进入项目 →</Link>}
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
