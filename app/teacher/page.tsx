"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import { TEACHER_QUESTION_REVIEW_COPY } from "@/lib/qa-ui-rules.mjs";
import { getAuthorizationStatusLabel, getTeacherOutcomeReviewTabs } from "@/lib/review-authorization-rules.mjs";
import { getTeacherStudentStatusCopy } from "@/lib/admin-teacher-workspace-rules.mjs";

interface DashboardData {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalProjects: number;
  pendingAnswers: number;
  totalRegistrations: number;
}

interface PendingAnswer {
  id: string;
  videoUrl: string;
  description: string | null;
  createdAt: string;
  lecturer: { name: string | null; grade: number | null };
  question: { title: string; content: string };
}

interface PendingQuestion {
  id: string;
  title: string;
  content: string;
  recognizedText?: string | null;
  imageUrl?: string | null;
  grade: number | null;
  topic: string | null;
  confusionType?: string | null;
  author: { name: string | null; region?: string | null };
}

interface OutcomeItem {
  id: string;
  sourceType: "ANSWER" | "PROJECT_ARTIFACT";
  title: string;
  childName: string;
  grade?: number | null;
  projectTitle?: string;
  groupName?: string;
  description?: string;
  artifactUrl?: string;
  reviewStatus: string;
  shareScope: string;
  teacherNote?: string;
  statusLabel?: string;
}

interface UserItem {
  id: string;
  name: string | null;
  phone: string;
  role: string;
  grade: number | null;
  region: string | null;
  points: number;
  growthEnergy?: number;
  isActive: boolean;
  createdAt: string;
}

export default function TeacherPage() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([]);
  const [outcomeView, setOutcomeView] = useState<"pending" | "public" | "withdrawn">("pending");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "questions" | "answers" | "outcomes" | "users">("dashboard");

  const isTeacher = session?.user?.role === "TEACHER";

  useEffect(() => {
    if (!isTeacher) {
      setLoading(false);
      return;
    }
    loadData();
  }, [isTeacher, outcomeView]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/math-young-lecturer/api/teacher/dashboard").then((r) => r.json()),
      fetch("/math-young-lecturer/api/teacher/answers").then((r) => r.json()),
      fetch("/math-young-lecturer/api/questions?status=OPEN&reviewStatus=PENDING").then((r) => r.json()),
      fetch(`/math-young-lecturer/api/teacher/outcomes?view=${outcomeView}`).then((r) => r.json()),
      fetch("/math-young-lecturer/api/teacher/users").then((r) => r.json()),
    ]).then(([dashData, answersData, questionsData, outcomesData, usersData]) => {
      setDashboard(dashData);
      setPendingAnswers(Array.isArray(answersData) ? answersData : []);
      setPendingQuestions(Array.isArray(questionsData) ? questionsData : questionsData.questions || []);
      setOutcomes(Array.isArray(outcomesData) ? outcomesData : outcomesData.outcomes || []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const handleQuestionReview = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/math-young-lecturer/api/teacher/questions/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "操作失败");
      setPendingQuestions((prev) => prev.filter((q) => q.id !== id));
      alert(action === "approve" ? data.growthEnergy?.userMessage || TEACHER_QUESTION_REVIEW_COPY.approveMessage : data.reviewNote || TEACHER_QUESTION_REVIEW_COPY.rejectMessage);
    } catch (e: any) {
      alert(e.message || "操作失败");
    }
  };

  const handleAnswerReview = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/math-young-lecturer/api/teacher/answers/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "操作失败");
      setPendingAnswers((prev) => prev.filter((a) => a.id !== id));
      alert(action === "approve" ? data.growthEnergy?.userMessage || "已通过，孩子会收到私密讲解成长能量。" : "已退回修改");
    } catch (e: any) {
      alert(e.message || "操作失败");
    }
  };

  const handleOutcomeReview = async (outcome: OutcomeItem, action: "approve" | "reject", shareScope = "GROUP_ONLY") => {
    try {
      const res = await fetch("/math-young-lecturer/api/teacher/outcomes/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType: outcome.sourceType,
          id: outcome.id,
          action,
          shareScope,
          teacherNote: action === "approve" ? "老师看见了这份作品里的真实思考，适合分享给更多同学作为启发。" : "请补充作品说明或过程记录后再提交。",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "操作失败");
      setOutcomes((prev) => prev.filter((item) => item.id !== outcome.id || item.sourceType !== outcome.sourceType));
      alert(action === "approve" ? "成果审核已完成。" : "已退回成果，作品记录仍保留。");
    } catch (e: any) {
      alert(e.message || "操作失败");
    }
  };

  const handleOutcomeWithdraw = async (outcome: OutcomeItem) => {
    try {
      const res = await fetch("/math-young-lecturer/api/outcomes/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceType: outcome.sourceType, id: outcome.id, reason: "由老师撤回公开授权，作品保留为学习记录。" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "操作失败");
      setOutcomes((prev) => prev.filter((item) => item.id !== outcome.id || item.sourceType !== outcome.sourceType));
      alert(data.message || "公开授权已撤回。");
    } catch (e: any) {
      alert(e.message || "操作失败");
    }
  };

  const handleActivate = async (userId: string, activate: boolean) => {
    try {
      const res = await fetch(`/math-young-lecturer/api/teacher/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, activate }),
      });
      if (res.ok) {
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isActive: activate } : u)));
        alert(activate ? "已开放基础参与" : "已暂停基础参与");
      }
    } catch (e) {
      alert("操作失败");
    }
  };

  const inactiveUsers = users.filter((u) => !u.isActive && u.role === "STUDENT");
  const outcomeTabs = getTeacherOutcomeReviewTabs();
  const studentStatusCopy = getTeacherStudentStatusCopy();

  if (!session?.user) return <main className="forest-page-shell guardian-workbench-shell"><Navbar /><div className="text-center py-20"><p className="text-ink-light">请先登录</p></div></main>;
  if (!isTeacher) return <main className="forest-page-shell guardian-workbench-shell"><Navbar /><div className="text-center py-20"><div className="text-4xl mb-3">🚫</div><p className="text-ink font-medium">无权访问</p><p className="text-ink-light text-sm mt-1">该页面仅对老师开放</p></div></main>;

  return (
    <main className="forest-page-shell guardian-workbench-shell">
      <Navbar />
      <section className="forest-page-content guardian-workbench-shell">
        <div className="guardian-workbench-hero">
          <span className="forest-page-eyebrow">守林人工作台｜老师</span>
          <h1 className="text-2xl font-bold text-ink handwritten-title mt-3">📊 老师工作台</h1>
          <p className="text-ink-light text-sm mt-2">先保护孩子表达，再守住数学与公开分享边界。</p>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: "dashboard", label: "📊 数据看板", count: 0 },
            { key: "questions", label: "🌱 审核问题", count: pendingQuestions.length },
            { key: "answers", label: "✅ 审核讲题", count: pendingAnswers.length },
            { key: "outcomes", label: "🌳 成果审核", count: outcomes.length },
            { key: "users", label: studentStatusCopy.tabLabel, count: inactiveUsers.length },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${activeTab === tab.key ? "hand-btn hand-btn-yellow text-sm py-2 px-4" : "hand-btn hand-btn-white text-sm py-2 px-4"}`}>
              {tab.label}
              {tab.count > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-crayon-pink rounded-full text-[10px] flex items-center justify-center text-ink font-bold">{tab.count}</span>}
            </button>
          ))}
        </div>

        {loading ? <div className="text-center py-12 text-ink-light">加载中...</div> : activeTab === "dashboard" ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 guardian-card">
              {[
                { label: "总用户", value: dashboard?.totalUsers || 0, icon: "👤", color: "sticker-blue" },
                { label: "总问题", value: dashboard?.totalQuestions || 0, icon: "🙋", color: "sticker-green" },
                { label: "总讲题", value: dashboard?.totalAnswers || 0, icon: "🎤", color: "sticker-yellow" },
                { label: "待处理", value: (dashboard?.pendingAnswers || 0) + pendingQuestions.length, icon: "⏳", color: "sticker-pink" },
                { label: "项目数", value: dashboard?.totalProjects || 0, icon: "🎯", color: "sticker-orange" },
                { label: "报名人数", value: dashboard?.totalRegistrations || 0, icon: "📖", color: "sticker-white" },
              ].map((card) => <div key={card.label} className={`sticker ${card.color} text-center py-5`}><div className="text-2xl mb-1">{card.icon}</div><p className="text-2xl font-bold text-ink handwritten-title">{card.value}</p><p className="text-xs text-ink-light">{card.label}</p></div>)}
            </div>
            <div className="guardian-panel"><h3 className="font-bold text-ink mb-3">⚡ 快速操作</h3><div className="flex flex-wrap gap-3"><button onClick={() => setActiveTab("questions")} className="hand-btn hand-btn-yellow text-sm">🌱 去审核问题</button><button onClick={() => setActiveTab("answers")} className="hand-btn hand-btn-green text-sm">✅ 去审核讲题</button><button onClick={() => setActiveTab("outcomes")} className="hand-btn hand-btn-yellow text-sm">🌳 去成果审核</button><button onClick={() => setActiveTab("users")} className="hand-btn hand-btn-blue text-sm">👤 查看学生状态</button></div></div>
          </>
        ) : activeTab === "questions" ? (
          pendingQuestions.length === 0 ? <div className="sticker sticker-white text-center py-12"><div className="text-4xl mb-3">🌿</div><p className="text-ink font-medium">没有待审核的问题</p><p className="text-ink-light text-sm mt-1">审核通过的问题才会开放认领。</p></div> :
          <div className="space-y-4">
            {pendingQuestions.map((q) => <div key={q.id} className="sticker sticker-white"><div className="flex items-start justify-between gap-4 mb-3"><div><h3 className="font-bold text-ink">{q.title}</h3><p className="text-xs text-ink-light mt-1">{q.grade && `${q.grade}年级 · `}{q.topic || "未标知识点"}{q.confusionType && ` · 卡点：${q.confusionType}`}</p><p className="text-xs text-ink-light mt-1">提问人：{q.author?.name || "小朋友"}</p></div><div className="flex gap-2"><button onClick={() => handleQuestionReview(q.id, "approve")} className="hand-btn text-xs hand-btn-green">✅ 通过</button><button onClick={() => handleQuestionReview(q.id, "reject")} className="hand-btn text-xs hand-btn-pink">↩️ 补充</button></div></div>{q.imageUrl && <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue text-sm underline">📷 查看题目图片</a>}{q.recognizedText && <p className="text-sm text-ink-light mt-2 whitespace-pre-wrap bg-paper rounded-xl p-3">{q.recognizedText}</p>}<p className="text-sm text-ink-light mt-2 whitespace-pre-wrap">{q.content}</p><p className="text-xs text-ink-light mt-3">{TEACHER_QUESTION_REVIEW_COPY.approveMessage} {TEACHER_QUESTION_REVIEW_COPY.rejectMessage}</p></div>)}
          </div>
        ) : activeTab === "answers" ? (
          pendingAnswers.length === 0 ? <div className="sticker sticker-white text-center py-12"><div className="text-4xl mb-3">🎉</div><p className="text-ink font-medium">没有待审核的讲题</p><p className="text-ink-light text-sm mt-1">所有讲题都已处理完毕</p></div> :
          <div className="space-y-4">
            {pendingAnswers.map((answer) => <div key={answer.id} className="sticker sticker-white"><div className="flex items-start justify-between gap-4 mb-3"><div><h3 className="font-bold text-ink">{answer.question.title}</h3><p className="text-xs text-ink-light mt-1">讲师：{answer.lecturer.name || "小讲师"}{answer.lecturer.grade && ` · ${answer.lecturer.grade}年级`}</p></div><div className="flex gap-2"><button onClick={() => handleAnswerReview(answer.id, "approve")} className="hand-btn text-xs hand-btn-green">✅ 通过</button><button onClick={() => handleAnswerReview(answer.id, "reject")} className="hand-btn text-xs hand-btn-pink">↩️ 退回</button></div></div>{answer.videoUrl && <a href={answer.videoUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue hover:underline text-sm">📹 查看视频</a>}{answer.description && <p className="text-sm text-ink-light mt-2">{answer.description}</p>}<p className="text-sm text-ink-light mt-2 p-3 bg-paper rounded-xl">题目：{answer.question.content}</p></div>)}
          </div>
        ) : activeTab === "outcomes" ? (
          <div className="space-y-4">
            <div className="sticker sticker-white">
              <h3 className="font-bold text-ink mb-2">🌳 成果审核与授权管理</h3>
              <p className="text-sm text-ink-light mb-3">进入成果广场必须同时满足：老师审核通过、孩子/家长授权公开。公开授权可撤回，撤回后作品仍保留为学习记录。</p>
              <div className="flex flex-wrap gap-2">
                {outcomeTabs.map((tab) => (
                  <button key={tab.key} onClick={() => setOutcomeView(tab.key === "public-authorized" ? "public" : tab.key === "withdrawn" ? "withdrawn" : "pending")} className={`hand-btn text-xs ${((tab.key === "pending-outcomes" && outcomeView === "pending") || (tab.key === "public-authorized" && outcomeView === "public") || (tab.key === "withdrawn" && outcomeView === "withdrawn")) ? "hand-btn-yellow" : "hand-btn-white"}`}>{tab.label}</button>
                ))}
              </div>
            </div>
            {outcomes.length === 0 ? <div className="sticker sticker-white text-center py-12"><div className="text-4xl mb-3">🌿</div><p className="text-ink font-medium">当前没有需要处理的成果</p><p className="text-ink-light text-sm mt-1">作品提交、讲解审核和公开授权会在这里形成闭环。</p></div> : outcomes.map((outcome) => (
              <div key={`${outcome.sourceType}-${outcome.id}`} className="sticker sticker-white">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-xs text-ink-light">{outcome.sourceType === "PROJECT_ARTIFACT" ? "项目作品" : "讲解成果"}{outcome.projectTitle && ` · ${outcome.projectTitle}`}{outcome.groupName && ` · ${outcome.groupName}`}</p>
                    <h3 className="font-bold text-ink mt-1">{outcome.title}</h3>
                    <p className="text-xs text-ink-light mt-1">作者：{outcome.childName || "小朋友"}{outcome.grade && ` · ${outcome.grade}年级`}</p>
                    <p className="text-xs text-ink-light mt-1">{getAuthorizationStatusLabel({ reviewStatus: outcome.reviewStatus, shareScope: outcome.shareScope })}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {outcomeView === "pending" && <><button onClick={() => handleOutcomeReview(outcome, "approve", "PUBLIC_HALL")} className="hand-btn text-xs hand-btn-green">✅ 通过并公开</button><button onClick={() => handleOutcomeReview(outcome, "approve", outcome.sourceType === "PROJECT_ARTIFACT" ? "GROUP_ONLY" : "QUESTION_AUTHOR_ONLY")} className="hand-btn text-xs hand-btn-blue">✅ 仅保留记录</button><button onClick={() => handleOutcomeReview(outcome, "reject")} className="hand-btn text-xs hand-btn-pink">↩️ 退回补充</button></>}
                    {outcomeView === "public" && <button onClick={() => handleOutcomeWithdraw(outcome)} className="hand-btn text-xs hand-btn-pink">↩️ 撤回公开授权</button>}
                  </div>
                </div>
                {outcome.artifactUrl && <a href={outcome.artifactUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue text-sm underline">🔗 查看作品链接</a>}
                {outcome.description && <p className="text-sm text-ink-light mt-2 whitespace-pre-wrap bg-paper rounded-xl p-3">{outcome.description}</p>}
                <p className="text-xs text-ink-light mt-3">不展示排名、不公开成长能量；老师只确认是否适合被更多同学看见。</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="sticker sticker-white">
              <h3 className="font-bold text-ink mb-2">{studentStatusCopy.heading}</h3>
              <p className="text-sm text-ink-light">{studentStatusCopy.helper}</p>
            </div>
            {users.map((user) => <div key={user.id} className="sticker sticker-white flex items-center justify-between gap-4"><div><p className="font-bold text-ink">{user.name || "未命名"}</p><p className="text-xs text-ink-light">{user.phone} · {user.role}{user.grade && ` · ${user.grade}年级`}</p><p className="text-xs text-ink-light mt-1">成长能量：{user.growthEnergy ?? user.points}</p><p className="text-xs text-ink-light mt-1">当前状态：{user.isActive ? "基础参与已开放" : "基础参与已暂停"}</p></div>{user.role === "STUDENT" && <button onClick={() => handleActivate(user.id, !user.isActive)} className={`hand-btn text-xs ${user.isActive ? "hand-btn-pink" : "hand-btn-green"}`}>{user.isActive ? studentStatusCopy.deactivateLabel : studentStatusCopy.activateLabel}</button>}</div>)}
          </div>
        )}
      </section>
    </main>
  );
}
