"use client";

import { useEffect, useRef, useState } from "react";
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
  recentQuestions?: PendingQuestion[];
  recentAnswers?: PendingAnswer[];
  pendingReviewItems?: { id: string; title: string; type: string; owner?: string | null }[];
}

interface PendingAnswer {
  id: string;
  videoUrl: string;
  description: string | null;
  createdAt: string;
  lecturer: { name: string | null; grade: number | null };
  question: { title: string; content: string };
  status?: string;
  reviewStatus?: string;
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
  status?: string;
  reviewStatus?: string;
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

type TeacherNotice = {
  message: string;
  type: "success" | "error" | "info";
} | null;

function normalizeReviewAssetUrl(url?: string | null) {
  const value = String(url || "").trim();
  if (!value) return "";
  if (/^https?:\/\//.test(value)) return value;
  if (value.startsWith("/math-young-lecturer/")) return value;
  if (value.startsWith("/")) return `/math-young-lecturer${value}`;
  return value;
}

export default function TeacherPage() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [approvedAnswers, setApprovedAnswers] = useState<PendingAnswer[]>([]);
  const [answerView, setAnswerView] = useState<"pending" | "approved">("pending");
  const [pendingQuestions, setPendingQuestions] = useState<PendingQuestion[]>([]);
  const [approvedQuestions, setApprovedQuestions] = useState<PendingQuestion[]>([]);
  const [questionView, setQuestionView] = useState<"pending" | "approved">("pending");
  const [selectedDashboardCard, setSelectedDashboardCard] = useState("总问题");
  const [outcomes, setOutcomes] = useState<OutcomeItem[]>([]);
  const [outcomeView, setOutcomeView] = useState<"pending" | "public" | "withdrawn">("pending");
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "questions" | "answers" | "outcomes" | "users">("dashboard");
  const [notice, setNotice] = useState<TeacherNotice>(null);
  const dashboardDetailRef = useRef<HTMLDivElement | null>(null);

  const showTeacherNotice = (message: string, type: TeacherNotice["type"] = "success") => {
    setNotice({ message, type });
  };

  const handleSelectDashboardCard = (label: string) => {
    setSelectedDashboardCard(label);
    window.requestAnimationFrame(() => {
      dashboardDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      dashboardDetailRef.current?.focus();
    });
  };

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
      fetch("/math-young-lecturer/api/teacher/answers?view=pending").then((r) => r.json()),
      fetch("/math-young-lecturer/api/teacher/answers?view=approved").then((r) => r.json()),
      fetch("/math-young-lecturer/api/questions?status=OPEN&reviewStatus=PENDING").then((r) => r.json()),
      fetch("/math-young-lecturer/api/questions?status=OPEN&reviewStatus=APPROVED").then((r) => r.json()),
      fetch(`/math-young-lecturer/api/teacher/outcomes?view=${outcomeView}`).then((r) => r.json()),
      fetch("/math-young-lecturer/api/teacher/users").then((r) => r.json()),
    ]).then(([dashData, answersData, approvedAnswersData, questionsData, approvedQuestionsData, outcomesData, usersData]) => {
      setDashboard(dashData);
      setPendingAnswers(Array.isArray(answersData) ? answersData : []);
      setApprovedAnswers(Array.isArray(approvedAnswersData) ? approvedAnswersData : []);
      setPendingQuestions(Array.isArray(questionsData) ? questionsData : questionsData.questions || []);
      setApprovedQuestions(Array.isArray(approvedQuestionsData) ? approvedQuestionsData : approvedQuestionsData.questions || []);
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
      setPendingQuestions((prev) => {
        const reviewed = prev.find((q) => q.id === id);
        if (action === "approve" && reviewed) {
          setApprovedQuestions((prev) => [{ ...reviewed, reviewStatus: "APPROVED" }, ...prev]);
        }
        return prev.filter((q) => q.id !== id);
      });
      showTeacherNotice(action === "approve" ? data.growthEnergy?.userMessage || "已通过问题，已移入已通过问题归档。" : data.reviewNote || TEACHER_QUESTION_REVIEW_COPY.rejectMessage);
    } catch (e: any) {
      showTeacherNotice(e.message || "操作失败", "error");
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
      setPendingAnswers((prev) => {
        const reviewed = prev.find((a) => a.id === id);
        if (action === "approve" && reviewed) {
          setApprovedAnswers((prevApproved) => [{ ...reviewed, status: "APPROVED", reviewStatus: "APPROVED" }, ...prevApproved]);
        }
        return prev.filter((a) => a.id !== id);
      });
      showTeacherNotice(action === "approve" ? data.growthEnergy?.userMessage || "已通过讲题，已移入已通过讲题归档。" : "已退回修改");
    } catch (e: any) {
      showTeacherNotice(e.message || "操作失败", "error");
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
      showTeacherNotice(action === "approve" ? "成果审核已完成。" : "已退回成果，作品记录仍保留。");
    } catch (e: any) {
      showTeacherNotice(e.message || "操作失败", "error");
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
      showTeacherNotice(data.message || "公开授权已撤回。");
    } catch (e: any) {
      showTeacherNotice(e.message || "操作失败", "error");
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
        setActiveTab("users");
        showTeacherNotice(activate ? "已开放基础参与" : "已暂停基础参与");
      } else {
        const data = await res.json().catch(() => ({}));
        showTeacherNotice(data.error || "操作失败", "error");
      }
    } catch (e) {
      showTeacherNotice("操作失败", "error");
    }
  };

  const inactiveUsers = users.filter((u) => !u.isActive && u.role === "STUDENT");
  const outcomeTabs = getTeacherOutcomeReviewTabs();
  const studentStatusCopy = getTeacherStudentStatusCopy();
  const visibleQuestions = questionView === "approved" ? approvedQuestions : pendingQuestions;
  const visibleAnswers = answerView === "approved" ? approvedAnswers : pendingAnswers;
  const dashboardCards = [
    { key: "users", label: "总用户", value: dashboard?.totalUsers || 0, icon: "👤", color: "sticker-blue", details: users.slice(0, 8).map((u) => `${u.name || "未命名"} · ${u.role}`) },
    { key: "questions", label: "总问题", value: dashboard?.totalQuestions || 0, icon: "🙋", color: "sticker-green", details: (dashboard?.recentQuestions || approvedQuestions || []).slice(0, 8).map((q) => `${q.title} · ${q.reviewStatus || "待审核"}`) },
    { key: "answers", label: "总讲题", value: dashboard?.totalAnswers || 0, icon: "🎤", color: "sticker-yellow", details: (dashboard?.recentAnswers || approvedAnswers || []).slice(0, 8).map((a) => `${a.question?.title || "讲题"} · ${a.reviewStatus || a.status || "待审核"}`) },
    { key: "pending", label: "待处理", value: (dashboard?.pendingAnswers || 0) + pendingQuestions.length, icon: "⏳", color: "sticker-pink", details: (dashboard?.pendingReviewItems || []).slice(0, 8).map((item) => `${item.type} · ${item.title}`) },
    { key: "projects", label: "项目数", value: dashboard?.totalProjects || 0, icon: "🎯", color: "sticker-orange", details: ["项目总数来自当前项目库，点击后台项目数据库可看更多。"] },
    { key: "registrations", label: "报名人数", value: dashboard?.totalRegistrations || 0, icon: "📖", color: "sticker-white", details: ["报名人数来自项目报名意向和确认记录。"] },
  ];
  const selectedDashboard = dashboardCards.find((card) => card.label === selectedDashboardCard) || dashboardCards[1];

  if (!session?.user) return <main className="forest-page-shell forest-workspace-shell"><Navbar /><div className="text-center py-20"><p className="text-ink-light">请先登录</p></div></main>;
  if (!isTeacher) return <main className="forest-page-shell forest-workspace-shell"><Navbar /><div className="text-center py-20"><span className="forest-v2-icon forest-icon-question mx-auto mb-3" aria-hidden="true" /><p className="text-ink font-medium">无权访问</p><p className="text-ink-light text-sm mt-1">该页面仅对老师开放</p></div></main>;

  return (
    <main className="forest-page-shell forest-workspace-shell">
      <Navbar />
      <section className="forest-page-content forest-workspace-content">
        <div className="forest-page-hero forest-workspace-hero">
          <span className="forest-page-eyebrow">守林人工作台｜老师</span>
          <h1 className="forest-page-title">老师工作台</h1>
          <p className="forest-page-subtitle">先保护孩子表达，再守住数学与公开分享边界。</p>
        </div>

        {notice && (
          <div role="status" className={`forest-panel mb-4 text-sm text-ink ${notice.type === "error" ? "bg-red-50 border-red-200" : notice.type === "info" ? "bg-crayon-blue/15" : "bg-crayon-green/20"}`}>
            {notice.message}
          </div>
        )}

        <div className="forest-workspace-tabs flex gap-2 mb-6 flex-wrap">
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
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8 forest-card-grid three">
              {dashboardCards.map((card) => <button type="button" key={card.label} aria-expanded={selectedDashboardCard === card.label} aria-controls="teacher-dashboard-detail" onClick={() => handleSelectDashboardCard(card.label)} className={`forest-dashboard-card ${card.color} text-center py-5 ${selectedDashboardCard === card.label ? "ring-2 ring-ink/30" : ""}`}><div className="text-2xl mb-1">{card.icon}</div><p className="text-2xl font-bold text-ink handwritten-title">{card.value}</p><p className="text-xs text-ink-light">{card.label}</p><p className="text-[11px] text-crayon-blue mt-1">查看明细</p></button>)}
            </div>
            <div id="teacher-dashboard-detail" ref={dashboardDetailRef} tabIndex={-1} className="forest-panel forest-workspace-panel mb-4"><p className="text-xs text-crayon-blue mb-1">已展开：{selectedDashboard.label}</p><h3 className="font-bold text-ink mb-3">数据明细 · {selectedDashboard.label}</h3><div className="space-y-2 text-sm text-ink-light">{selectedDashboard.details.length > 0 ? selectedDashboard.details.map((item, index) => <p key={index} className="forest-info-card p-2">{item}</p>) : <p>暂无可展开的数据。</p>}</div></div>
            <div className="forest-panel forest-workspace-panel"><h3 className="font-bold text-ink mb-3">⚡ 快速操作</h3><div className="flex flex-wrap gap-3"><button onClick={() => setActiveTab("questions")} className="hand-btn hand-btn-yellow text-sm">🌱 去审核问题</button><button onClick={() => setActiveTab("answers")} className="hand-btn hand-btn-green text-sm">✅ 去审核讲题</button><button onClick={() => setActiveTab("outcomes")} className="hand-btn hand-btn-yellow text-sm">🌳 去成果审核</button><button onClick={() => setActiveTab("users")} className="hand-btn hand-btn-blue text-sm">👤 查看学生状态</button></div></div>
          </>
        ) : activeTab === "questions" ? (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><button onClick={() => setQuestionView("pending")} className={`hand-btn text-xs ${questionView === "pending" ? "hand-btn-yellow" : "hand-btn-white"}`}>待审核问题</button><button onClick={() => setQuestionView("approved")} className={`hand-btn text-xs ${questionView === "approved" ? "hand-btn-yellow" : "hand-btn-white"}`}>已通过问题</button></div>
            {visibleQuestions.length === 0 ? <div className="forest-empty"><span className="forest-v2-icon forest-icon-seed mx-auto mb-3" aria-hidden="true" /><p className="text-ink font-medium">{questionView === "approved" ? "还没有已通过问题" : "没有待审核的问题"}</p><p className="text-ink-light text-sm mt-1">审核通过的问题会在已通过问题归档里保留。</p></div> : visibleQuestions.map((q) => <div key={q.id} className="forest-card"><div className="flex items-start justify-between gap-4 mb-3"><div><h3 className="font-bold text-ink">{q.title}</h3><p className="text-xs text-ink-light mt-1">{q.grade && `${q.grade}年级 · `}{q.topic || "未标知识点"}{q.confusionType && ` · 卡点：${q.confusionType}`}</p><p className="text-xs text-ink-light mt-1">提问人：{q.author?.name || "小朋友"}</p></div><div className="flex gap-2">{questionView === "pending" ? <><button onClick={() => handleQuestionReview(q.id, "approve")} className="hand-btn text-xs hand-btn-green">✅ 通过</button><button onClick={() => handleQuestionReview(q.id, "reject")} className="hand-btn text-xs hand-btn-pink">↩️ 补充</button></> : <span className="hand-badge hand-badge-green text-xs">已通过</span>}</div></div>{q.imageUrl && <a href={q.imageUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue text-sm underline">📷 查看题目图片</a>}{q.recognizedText && <p className="text-sm text-ink-light mt-2 whitespace-pre-wrap forest-note-card p-3">{q.recognizedText}</p>}<p className="text-sm text-ink-light mt-2 whitespace-pre-wrap">{q.content}</p><p className="text-xs text-ink-light mt-3">{TEACHER_QUESTION_REVIEW_COPY.approveMessage} {TEACHER_QUESTION_REVIEW_COPY.rejectMessage}</p></div>)}
          </div>
        ) : activeTab === "answers" ? (
          <div className="space-y-4">
            <div className="flex gap-2 flex-wrap"><button onClick={() => setAnswerView("pending")} className={`hand-btn text-xs ${answerView === "pending" ? "hand-btn-yellow" : "hand-btn-white"}`}>待审核讲题</button><button onClick={() => setAnswerView("approved")} className={`hand-btn text-xs ${answerView === "approved" ? "hand-btn-yellow" : "hand-btn-white"}`}>已通过讲题</button></div>
            {visibleAnswers.length === 0 ? <div className="forest-empty"><span className="forest-v2-icon forest-icon-tree mx-auto mb-3" aria-hidden="true" /><p className="text-ink font-medium">{answerView === "approved" ? "还没有已通过讲题" : "没有待审核的讲题"}</p><p className="text-ink-light text-sm mt-1">审核通过后会在已通过讲题归档中保留。</p></div> : visibleAnswers.map((answer) => <div key={answer.id} className="forest-card"><div className="flex items-start justify-between gap-4 mb-3"><div><h3 className="font-bold text-ink">{answer.question.title}</h3><p className="text-xs text-ink-light mt-1">讲师：{answer.lecturer.name || "小讲师"}{answer.lecturer.grade && ` · ${answer.lecturer.grade}年级`}</p></div><div className="flex gap-2">{answerView === "pending" ? <><button onClick={() => handleAnswerReview(answer.id, "approve")} className="hand-btn text-xs hand-btn-green">✅ 通过</button><button onClick={() => handleAnswerReview(answer.id, "reject")} className="hand-btn text-xs hand-btn-pink">↩️ 退回</button></> : <span className="hand-badge hand-badge-green text-xs">已通过</span>}</div></div>{answer.videoUrl && <div className="space-y-1"><a href={normalizeReviewAssetUrl(answer.videoUrl)} target="_blank" rel="noopener noreferrer" className="text-crayon-blue hover:underline text-sm">📹 查看视频</a><p className="text-[11px] text-ink-light">无法打开时请复制链接到浏览器：{normalizeReviewAssetUrl(answer.videoUrl)}</p></div>}{answer.description && <p className="text-sm text-ink-light mt-2">{answer.description}</p>}<p className="text-sm text-ink-light mt-2 p-3 forest-note-card">题目：{answer.question.content}</p></div>)}
          </div>
        ) : activeTab === "outcomes" ? (
          <div className="space-y-4">
            <div className="forest-card">
              <h3 className="font-bold text-ink mb-2">🌳 成果审核与授权管理</h3>
              <p className="text-sm text-ink-light mb-3">进入成果广场必须同时满足：老师审核通过、孩子/家长授权公开。公开授权可撤回，撤回后作品仍保留为学习记录。</p>
              <div className="flex flex-wrap gap-2">
                {outcomeTabs.map((tab) => (
                  <button key={tab.key} onClick={() => setOutcomeView(tab.key === "public-authorized" ? "public" : tab.key === "withdrawn" ? "withdrawn" : "pending")} className={`hand-btn text-xs ${((tab.key === "pending-outcomes" && outcomeView === "pending") || (tab.key === "public-authorized" && outcomeView === "public") || (tab.key === "withdrawn" && outcomeView === "withdrawn")) ? "hand-btn-yellow" : "hand-btn-white"}`}>{tab.label}</button>
                ))}
              </div>
            </div>
            {outcomes.length === 0 ? <div className="forest-empty"><span className="forest-v2-icon forest-icon-seed mx-auto mb-3" aria-hidden="true" /><p className="text-ink font-medium">当前没有需要处理的成果</p><p className="text-ink-light text-sm mt-1">作品提交、讲解审核和公开授权会在这里形成闭环。</p></div> : outcomes.map((outcome) => (
              <div key={`${outcome.sourceType}-${outcome.id}`} className="forest-card">
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
                {outcome.artifactUrl && <div className="space-y-1"><a href={normalizeReviewAssetUrl(outcome.artifactUrl)} target="_blank" rel="noopener noreferrer" className="text-crayon-blue text-sm underline">🔗 查看作品链接</a><p className="text-[11px] text-ink-light">无法打开时请复制链接到浏览器：{normalizeReviewAssetUrl(outcome.artifactUrl)}</p></div>}
                {outcome.description && <p className="text-sm text-ink-light mt-2 whitespace-pre-wrap forest-note-card p-3">{outcome.description}</p>}
                <p className="text-xs text-ink-light mt-3">不展示排名、不公开成长能量；老师只确认是否适合被更多同学看见。</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="forest-card">
              <h3 className="font-bold text-ink mb-2">{studentStatusCopy.heading}</h3>
              <p className="text-sm text-ink-light">{studentStatusCopy.helper}</p>
            </div>
            {users.map((user) => <div key={user.id} className="forest-card flex items-center justify-between gap-4"><div><p className="font-bold text-ink">{user.name || "未命名"}</p><p className="text-xs text-ink-light">{user.phone} · {user.role}{user.grade && ` · ${user.grade}年级`}</p><p className="text-xs text-ink-light mt-1">成长能量：{user.growthEnergy ?? user.points}</p><p className="text-xs text-ink-light mt-1">当前状态：{user.isActive ? "基础参与已开放" : "基础参与已暂停"}</p></div>{user.role === "STUDENT" && <button onClick={() => handleActivate(user.id, !user.isActive)} className={`hand-btn text-xs ${user.isActive ? "hand-btn-pink" : "hand-btn-green"}`}>{user.isActive ? studentStatusCopy.deactivateLabel : studentStatusCopy.activateLabel}</button>}</div>)}
          </div>
        )}
      </section>
    </main>
  );
}
