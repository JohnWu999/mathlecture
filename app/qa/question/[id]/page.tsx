"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

interface QuestionDetail {
  id: string;
  title: string;
  content: string;
  grade: number | null;
  topic: string | null;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
  authorId: string;
  author: { name: string | null };
  answers: {
    id: string;
    videoUrl: string;
    description: string | null;
    status: string;
    lecturer: { name: string | null };
  }[];
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/math-young-lecturer/api/questions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestion(data);
        setLoading(false);
      });
  }, [id]);

  const handleClaim = async () => {
    if (!session?.user) {
      alert("请先登录");
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/questions/${id}/claim`, {
        method: "POST",
      });
      if (res.ok) {
        alert("认领成功！请准备讲题视频");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "认领失败");
      }
    } catch (e) {
      alert("认领失败");
    }
    setClaiming(false);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, videoUrl, description }),
      });
      if (res.ok) {
        alert("讲题视频已提交，等待审核！");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || "提交失败");
      }
    } catch (e) {
      alert("提交失败");
    }
    setSubmitting(false);
  };

  const isClaimedByMe = question?.answers.some(
    (a) => a.lecturer.name === session?.user?.name && a.status === "PENDING"
  );

  if (loading) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">加载中...</div>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="min-h-screen">
        <Navbar />
        <div className="text-center py-20 text-ink-light">问题不存在</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-3xl mx-auto">
        {/* 问题卡片 */}
        <div className="sticker bg-white mb-6">
          <div className="flex items-center gap-2 mb-3">
            {question.grade && (
              <span className="px-2 py-0.5 bg-crayon-green/20 rounded-full text-xs font-medium">
                {question.grade}年级
              </span>
            )}
            {question.topic && (
              <span className="px-2 py-0.5 bg-crayon-blue/20 rounded-full text-xs font-medium">
                {question.topic}
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                question.status === "OPEN"
                  ? "bg-crayon-yellow/30"
                  : question.status === "CLAIMED"
                  ? "bg-crayon-blue/30"
                  : "bg-crayon-green/30"
              }`}
            >
              {question.status === "OPEN"
                ? "待认领"
                : question.status === "CLAIMED"
                ? "已被认领"
                : "已解决"}
            </span>
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">{question.title}</h1>
          <p className="text-ink-light leading-relaxed whitespace-pre-wrap">
            {question.content}
          </p>
          <p className="text-xs text-ink-light mt-3">
            提问人：{question.isAnonymous ? "匿名小朋友" : question.author.name || "小朋友"}
          </p>
        </div>

        {/* 操作区 */}
        {question.status === "OPEN" && !isClaimedByMe && (
          <div className="sticker bg-crayon-yellow text-center">
            <p className="text-ink font-medium mb-3">🎯 这道题等待小讲师认领</p>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="hand-btn bg-crayon-green text-ink disabled:opacity-50"
            >
              {claiming ? "认领中..." : "🙋 认领这道题"}
            </button>
          </div>
        )}

        {isClaimedByMe && (
          <div className="sticker bg-crayon-blue">
            <h3 className="font-bold text-ink mb-3">🎤 提交你的讲题视频</h3>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">视频链接</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none transition-colors"
                  placeholder="上传视频后填写链接..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">讲题说明（可选）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none transition-colors resize-none"
                  placeholder="简单说说你的讲解思路..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="hand-btn w-full bg-white text-ink disabled:opacity-50"
              >
                {submitting ? "提交中..." : "✅ 提交讲题视频"}
              </button>
            </form>
          </div>
        )}

        {/* 回答列表 */}
        {question.answers.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-ink mb-3">🎭 讲题回答</h3>
            {question.answers.map((answer) => (
              <div key={answer.id} className="sticker bg-white mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-ink">
                    {answer.lecturer.name || "小讲师"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      answer.status === "APPROVED"
                        ? "bg-crayon-green/30"
                        : "bg-crayon-yellow/30"
                    }`}
                  >
                    {answer.status === "APPROVED" ? "已审核" : "待审核"}
                  </span>
                </div>
                {answer.videoUrl && (
                  <a
                    href={answer.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-crayon-blue hover:underline text-sm"
                  >
                    📹 观看讲题视频
                  </a>
                )}
                {answer.description && (
                  <p className="text-sm text-ink-light mt-1">{answer.description}</p>
                )}

                {/* 提问者可采纳 */}
                {session?.user?.id === question.authorId &&
                  answer.status === "PENDING" &&
                  question.status !== "RESOLVED" && (
                    <button
                      onClick={async () => {
                        if (!confirm("确认采纳这个回答？")) return;
                        try {
                          const res = await fetch(
                            `/math-young-lecturer/api/answers/${answer.id}/approve`,
                            { method: "POST" }
                          );
                          if (res.ok) {
                            alert("采纳成功！小讲师获得10积分！");
                            window.location.reload();
                          } else {
                            alert("采纳失败");
                          }
                        } catch (e) {
                          alert("采纳失败");
                        }
                      }}
                      className="mt-2 text-xs px-3 py-1.5 bg-crayon-green rounded-lg hover:bg-crayon-green/80 transition-colors"
                    >
                      ✅ 采纳这个回答
                    </button>
                  )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
