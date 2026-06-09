"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import {
  formatProjectValidity,
  getProjectEnrollmentCopy,
  getProjectGrowthPrompt,
  getProjectReadiness,
  getProjectTeamStatus,
  getProjectTypeLabel,
  normalizeProjectForPublicListing,
} from "@/lib/project-camp-ui-rules.mjs";

interface ProjectDetail {
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
  publicPricingState?: "FREE_TRIAL" | "GUIDED_SERVICE";
  publicPricingNote?: string;
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
  const { data: session, status } = useSession();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [enterpriseWechat, setEnterpriseWechat] = useState("");
  const [consultation, setConsultation] = useState<any>(null);
  const [childName, setChildName] = useState("");
  const [grade, setGrade] = useState("");
  const [packageName, setPackageName] = useState("项目报名意向");
  const [contact, setContact] = useState("");
  const [note, setNote] = useState("");
  const isLoggedIn = !!session?.user;
  const loginToProjectHref = `/login?callbackUrl=/math-young-lecturer/projects/${id}`;

  useEffect(() => {
    fetch(`/math-young-lecturer/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data?.id ? normalizeProjectForPublicListing(data) : null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const detail = useMemo(() => {
    if (!project) return null;
    return {
      type: getProjectTypeLabel(project.projectType, project),
      readiness: getProjectReadiness(project),
      team: getProjectTeamStatus({
        registrations: project._count.registrations,
        groups: project._count.groups,
        groupSizeMin: project.groupSizeMin,
        groupSizeMax: project.groupSizeMax,
      }),
      validity: formatProjectValidity(project.validUntil),
      enrollment: getProjectEnrollmentCopy(project),
      growthPrompt: getProjectGrowthPrompt(),
    };
  }, [project]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setMessage("请先登录，再提交项目报名意向。登录后报名、项目权益和成果提交都会记录到孩子账号，方便老师跟进反馈。");
      return;
    }
    setRegistering(true);
    setMessage("");
    setEnterpriseWechat("");
    setConsultation(null);
    try {
      const res = await fetch(`/math-young-lecturer/api/projects/${id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ childName, grade: Number(grade), packageName, contact, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setMessage(data.childMessage || "报名意向已提交。老师会根据项目节奏、成组情况和服务内容确认下一步。");
        setConsultation(data.consultation || null);
        setEnterpriseWechat(data.enterpriseWechat || "报名意向已记录，管理员会在后台跟进状态。");
      } else if (res.status === 401) {
        setMessage("登录状态已过期，请重新登录后继续报名。");
      } else {
        setMessage(data.error || "报名意向提交失败，请稍后再试。");
      }
    } catch (e) {
      setMessage("报名意向提交失败，请稍后再试。");
    }
    setRegistering(false);
  };

  if (loading) {
    return (
      <main className="forest-page-shell">
        <Navbar />
        <div className="text-center py-20 text-ink-light">加载项目森林中...</div>
      </main>
    );
  }

  if (!project || !detail) {
    return (
      <main className="forest-page-shell">
        <Navbar />
        <div className="text-center py-20 text-ink-light">项目不存在或暂未开放</div>
      </main>
    );
  }

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content">
        <div className="forest-detail-hero text-center">
          <div className="text-5xl mb-3">🌳</div>
          <span className={`hand-badge ${detail.type.badgeClass} text-xs mb-3 inline-block`}>{detail.type.label}</span>
          <h1 className="text-2xl font-bold text-ink">{project.title}</h1>
          <p className="text-sm text-ink-light mt-2 max-w-2xl mx-auto">{detail.type.helper}</p>
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm">{project.durationDays}天探索</span>
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm">{detail.team.label}</span>
            <span className="px-3 py-1 bg-white/70 rounded-full text-sm">{detail.validity}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-[1.2fr_0.8fr] gap-6 mb-6">
          <div className="forest-card">
            <h2 className="font-bold text-ink mb-3">📝 项目介绍</h2>
            <p className="text-ink-light leading-relaxed whitespace-pre-wrap">{project.description}</p>
          </div>
          <div className="sticker bg-parchment">
            <h2 className="font-bold text-ink mb-3">{detail.readiness.title}</h2>
            <p className="text-sm text-ink-light leading-relaxed">{detail.readiness.summary}</p>
            <p className="text-xs text-ink-light mt-3">{detail.readiness.helper}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {detail.readiness.tags.map((tag) => <span key={tag} className="hand-badge hand-badge-blue text-xs">#{tag}</span>)}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="sticker bg-white">
            <h2 className="font-bold text-ink mb-3">👥 组队状态</h2>
            <p className="text-ink font-medium">{detail.team.label}</p>
            <p className="text-sm text-ink-light mt-2 leading-relaxed">{detail.team.helper}</p>
            <p className="text-xs text-ink-light mt-3">当前报名意向：{project._count.registrations} 人 · 小组：{project._count.groups} 组</p>
          </div>
          <div className="sticker bg-crayon-green/70">
            <h2 className="font-bold text-ink mb-3">🌿 探索成长提示</h2>
            <p className="text-sm text-ink-light leading-relaxed">{detail.growthPrompt}</p>
          </div>
        </div>

        <div className="forest-panel bg-crayon-green text-center mb-6">
          <p className="text-ink font-bold mb-1">{detail.enrollment.priceLabel}</p>
          <p className="text-sm text-ink-light mb-2 max-w-2xl mx-auto">{detail.enrollment.helper}</p>
          {project.publicPricingNote && (
            <p className="text-xs text-ink-light mb-4 max-w-2xl mx-auto">{project.publicPricingNote}</p>
          )}
          <div className="mb-4 mx-auto max-w-2xl rounded-2xl bg-white/75 border border-ink/10 p-4 text-left">
            <p className="text-sm font-bold text-ink">公开浏览不需要登录</p>
            <p className="text-xs text-ink-light mt-1 leading-relaxed">
              项目介绍、适合年级、学习目标、体验说明可以直接浏览；报名和加入项目需要登录，因为项目权益、作品提交和老师反馈都要记录到孩子账号，方便运营追踪和成长档案沉淀。
            </p>
          </div>
          {status === "loading" && (
            <div className="max-w-2xl mx-auto rounded-2xl bg-white/80 border border-ink/10 p-4 text-sm text-ink-light">正在确认登录状态...</div>
          )}
          {!isLoggedIn && status !== "loading" && (
            <div className="max-w-2xl mx-auto rounded-3xl bg-white/90 border border-ink/10 p-5 text-left space-y-4">
              <div>
                <p className="font-bold text-ink">报名和加入项目需要登录</p>
                <p className="text-sm text-ink-light mt-2 leading-relaxed">
                  登录后报名、查看项目权益、提交项目成果都会绑定到孩子账号。老师才能确认名额、跟进小组进度、推送反馈，并把项目过程写入成长记录。
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-center">
                <Link href={loginToProjectHref} className="hand-btn bg-crayon-yellow text-ink text-xs">登录后报名</Link>
                <Link href={loginToProjectHref} className="hand-btn bg-white text-ink text-xs">登录后查看项目权益</Link>
                <Link href={loginToProjectHref} className="hand-btn bg-white text-ink text-xs">登录后提交项目成果</Link>
              </div>
            </div>
          )}
          {isLoggedIn ? (
            <>
              <form onSubmit={handleRegister} className="max-w-2xl mx-auto text-left space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={childName} onChange={(e) => setChildName(e.target.value)} required placeholder="孩子昵称" className="px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none" />
                  <input value={grade} onChange={(e) => setGrade(e.target.value)} required type="number" min="1" max="3" placeholder="年级，如 3" className="px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none" />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <select value={packageName} onChange={(e) => setPackageName(e.target.value)} className="px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none">
                    <option>项目报名意向</option>
                    <option>5 次项目包</option>
                    <option>20 周项目包</option>
                    <option>先咨询再决定</option>
                  </select>
                  <input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="联系方式（可选）" className="px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none" />
                </div>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="想让老师了解的情况（可选）" className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none resize-none" />
                <div className="text-center">
                  <button type="submit" disabled={registering} className="hand-btn bg-white text-ink disabled:opacity-50">
                    {registering ? "提交中..." : detail.enrollment.cta}
                  </button>
                </div>
              </form>
              {message && <p className="text-sm text-ink mt-3">{message}</p>}
              {consultation ? (
                <div className="mt-4 mx-auto max-w-xl rounded-3xl bg-white/90 border border-ink/10 p-5 text-sm text-ink leading-relaxed grid sm:grid-cols-[150px_1fr] gap-4 items-center text-left">
                  <img src={consultation.qrImageUrl} alt="企业微信咨询二维码" className="h-36 w-36 rounded-2xl object-cover bg-paper border border-ink/10 mx-auto" />
                  <div>
                    <p className="font-bold text-ink">{consultation.title}</p>
                    <p className="text-xs text-ink-light mt-1">{consultation.contactTitle}</p>
                    <p className="text-sm text-ink-light mt-3 leading-relaxed">{consultation.description}</p>
                    <p className="text-xs text-ink-light mt-3">{consultation.helper}</p>
                  </div>
                </div>
              ) : enterpriseWechat ? (
                <div className="mt-3 mx-auto max-w-xl rounded-2xl bg-white/80 border border-ink/10 p-4 text-sm text-ink leading-relaxed">{enterpriseWechat}</div>
              ) : null}
            </>
          ) : null}
        </div>

        {project.groups.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-ink mb-3">👥 项目小组</h2>
            <div className="grid gap-3">
              {project.groups.map((g) => (
                <div key={g.id} className="sticker bg-white flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ink">{g.name}</h4>
                    <p className="text-xs text-ink-light">Day {g.dayProgress} / {project.durationDays} · {g._count.members}人</p>
                  </div>
                  <Link href={`/groups/${g.id}`} className="hand-btn text-xs bg-crayon-blue text-ink">进入协作空间</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
