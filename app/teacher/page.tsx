"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

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

export default function TeacherPage() {
  const { data: session } = useSession();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [pendingAnswers, setPendingAnswers] = useState<PendingAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "reviews">("dashboard");

  const isTeacher = session?.user?.role === "TEACHER" || session?.user?.role === "ADMIN";

  useEffect(() => {
    if (!isTeacher) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch("/math-young-lecturer/api/teacher/dashboard").then((r) => r.json()),
      fetch("/math-young-lecturer/api/teacher/answers").then((r) => r.json()),
    ]).then(([dashData, answersData]) => {
      setDashboard(dashData);
      setPendingAnswers(Array.isArray(answersData) ? answersData : []);
      setLoading(false);
    });
  }, [isTeacher]);

  const handleReview = async (id: string, action: "approve" | "reject") => {
    try {
      const res = await fetch(`/math-young-lecturer/api/teacher/answers/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setPendingAnswers((prev) => prev.filter((a) => a.id !== id));
        alert(action === "approve" ? "已通过！小讲师+10积分" : "已拒绝");
      }
    } catch (e) {
      alert("操作失败");
    }
  };

  if (!session?.user) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <p className="text-ink-light">请先登录</p>
        </div>
      </main>
    );
  }

  if (!isTeacher) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-ink font-medium">无权访问</p>
          <p className="text-ink-light text-sm mt-1">该页面仅对老师开放</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink">📊 老师工作台</h1>
          <p className="text-ink-light text-sm">管理平台、审核讲题、看数据</p>
        </div>

        {/* Tab 导航 */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === "dashboard"
                ? "bg-crayon-yellow text-ink"
                : "bg-white text-ink-light hover:bg-ink/5"
            }`}
          >
            📊 数据看板
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors relative ${
              activeTab === "reviews"
                ? "bg-crayon-yellow text-ink"
                : "bg-white text-ink-light hover:bg-ink/5"
            }`}
          >
            ✅ 审核讲题
            {pendingAnswers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-crayon-pink rounded-full text-[10px] flex items-center justify-center text-ink font-bold">
                {pendingAnswers.length}
              </span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-ink-light">加载中...</div>
        ) : activeTab === "dashboard" ? (
          <>
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {[
                { label: "总用户", value: dashboard?.totalUsers || 0, icon: "👤", color: "bg-crayon-blue" },
                { label: "总问题", value: dashboard?.totalQuestions || 0, icon: "🙋", color: "bg-crayon-green" },
                { label: "总讲题", value: dashboard?.totalAnswers || 0, icon: "🎤", color: "bg-crayon-yellow" },
                { label: "待审核", value: dashboard?.pendingAnswers || 0, icon: "⏳", color: "bg-crayon-pink" },
                { label: "项目数", value: dashboard?.totalProjects || 0, icon: "🎯", color: "bg-crayon-orange" },
                { label: "报名人数", value: dashboard?.totalRegistrations || 0, icon: "📖", color: "bg-crayon-purple" },
              ].map((card) => (
                <div key={card.label} className={`sticker ${card.color} text-center py-5`}>
                  <div className="text-2xl mb-1">{card.icon}</div>
                  <p className="text-2xl font-bold text-ink">{card.value}</p>
                  <p className="text-xs text-ink-light">{card.label}</p>
                </div>
              ))}
            </div>

            {/* 快速操作 */}
            <div className="sticker bg-white">
              <h3 className="font-bold text-ink mb-3">⚡ 快速操作</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveTab("reviews")}
                  className="hand-btn bg-crayon-green text-ink text-sm"
                >
                  ✅ 去审核讲题
                </button>
                <button
                  onClick={() => alert("项目创建功能即将上线")}
                  className="hand-btn bg-crayon-blue text-ink text-sm"
                >
                  ➕ 创建新项目
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 待审核列表 */}
            {pendingAnswers.length === 0 ? (
              <div className="sticker bg-white text-center py-12">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-ink font-medium">太棒了！没有待审核的讲题</p>
                <p className="text-ink-light text-sm mt-1">所有讲题都已处理完毕</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAnswers.map((answer) => (
                  <div key={answer.id} className="sticker bg-white">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="font-bold text-ink">{answer.question.title}</h3>
                        <p className="text-xs text-ink-light mt-1">
                          讲师：{answer.lecturer.name || "小讲师"}
                          {answer.lecturer.grade && ` · ${answer.lecturer.grade}年级`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(answer.id, "approve")}
                          className="hand-btn text-xs bg-crayon-green text-ink"
                        >
                          ✅ 通过
                        </button>
                        <button
                          onClick={() => handleReview(answer.id, "reject")}
                          className="hand-btn text-xs bg-crayon-pink text-ink"
                        >
                          ❌ 拒绝
                        </button>
                      </div>
                    </div>
                    {answer.videoUrl && (
                      <a
                        href={answer.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-crayon-blue hover:underline block mb-1"
                      >
                        📹 观看视频
                      </a>
                    )}
                    {answer.description && (
                      <p className="text-sm text-ink-light">{answer.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
