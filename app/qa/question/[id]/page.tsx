"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  formatClaimDeadline,
  getAnswerSubmitPrompt,
  getHeatPrompt,
  getQuestionStatusBadge,
  QUESTION_SHARE_OPTIONS,
} from "@/lib/qa-ui-rules.mjs";

interface QuestionDetail {
  id: string;
  title: string;
  suggestedTitle?: string | null;
  content: string;
  recognizedText?: string | null;
  imageUrl?: string | null;
  grade: number | null;
  topic: string | null;
  confusionType?: string | null;
  heatCount?: number;
  shareScope?: string;
  reviewStatus?: string;
  status: string;
  isAnonymous: boolean;
  createdAt: string;
  authorId: string;
  claimedById?: string | null;
  claimedAt?: string | null;
  claimExpiresAt?: string | null;
  author: { id?: string; name: string | null };
  claimedBy?: { id: string; name: string | null } | null;
  answers: {
    id: string;
    videoUrl: string;
    description: string | null;
    status: string;
    reviewStatus?: string;
    shareScope?: string;
    lecturer: { id?: string; name: string | null };
  }[];
}

export default function QuestionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [heating, setHeating] = useState(false);
  const [message, setMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [description, setDescription] = useState("");
  const [answerShareScope, setAnswerShareScope] = useState("QUESTION_AUTHOR_ONLY");
  const [submitting, setSubmitting] = useState(false);

  const loadQuestion = () => {
    setLoading(true);
    fetch(`/math-young-lecturer/api/questions/${id}`)
      .then((r) => r.json())
      .then((data) => {
        const nextQuestion = data.question || data;
        setQuestion(nextQuestion.error ? null : nextQuestion);
        if (data.sharingRule) setMessage(data.sharingRule);
        if (nextQuestion?.shareScope) setAnswerShareScope(nextQuestion.shareScope);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadQuestion();
  }, [id]);

  const handleClaim = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || `/qa/question/${id}`)}`);
      return;
    }
    setClaiming(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/questions/${id}/claim`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "认领失败");
      setMessage(data.childMessage || "认领成功，请在72小时内上传讲解。");
      loadQuestion();
    } catch (e: any) {
      setMessage(e.message || "认领失败");
    }
    setClaiming(false);
  };

  const handleHeat = async () => {
    if (!session?.user) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || `/qa/question/${id}`)}`);
      return;
    }
    setHeating(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/questions/${id}/heat`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "加热度失败");
      setQuestion((prev) => (prev ? { ...prev, heatCount: data.heatCount } : prev));
      setMessage(data.childMessage || "已经加了一点热度。");
    } catch (e: any) {
      setMessage(e.message || "加热度失败");
    }
    setHeating(false);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let finalVideoUrl = videoUrl;
      if (videoFile) {
        setUploadingVideo(true);
        const uploadForm = new FormData();
        uploadForm.append("kind", "answer-video");
        uploadForm.append("file", videoFile);
        const uploadRes = await fetch("/math-young-lecturer/api/uploads", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) throw new Error(uploadData.error || "讲题视频上传失败");
        finalVideoUrl = uploadData.url;
        setVideoUrl(finalVideoUrl);
      }
      const res = await fetch(`/math-young-lecturer/api/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: id, videoUrl: finalVideoUrl, description, shareScope: answerShareScope }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提交失败");
      setMessage(data.childMessage || getAnswerSubmitPrompt(answerShareScope));
      setVideoUrl("");
      setVideoFile(null);
      setDescription("");
      loadQuestion();
    } catch (e: any) {
      setMessage(e.message || "提交失败");
    }
    setSubmitting(false);
    setUploadingVideo(false);
  };

  const isClaimedByMe = useMemo(() => {
    if (!session?.user?.id || !question) return false;
    return question.claimedById === session.user.id || question.answers.some((a) => a.lecturer.id === session.user.id && a.status === "PENDING");
  }, [question, session?.user?.id]);

  if (loading) return <main className="forest-page-shell"><Navbar /><div className="text-center py-20 text-ink-light">加载中...</div></main>;
  if (!question) return <main className="forest-page-shell"><Navbar /><div className="text-center py-20 text-ink-light">问题不存在或还在审核中</div></main>;

  const statusBadge = getQuestionStatusBadge({ status: question.status, reviewStatus: question.reviewStatus || "APPROVED" });
  const heatPrompt = getHeatPrompt({ heatCount: question.heatCount || 0, hasHeated: false });
  const claimCopy = formatClaimDeadline({ claimExpiresAt: question.claimExpiresAt || undefined });

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content forest-page-content-narrow">
        {message && <div className="forest-panel bg-crayon-green/20 mb-4 text-sm text-ink">{message}</div>}

        <div className="forest-detail-hero">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {question.grade && <span className="px-2 py-0.5 bg-crayon-green/20 rounded-full text-xs font-medium">{question.grade}年级</span>}
            {question.topic && <span className="px-2 py-0.5 bg-crayon-blue/20 rounded-full text-xs font-medium">{question.topic}</span>}
            {question.confusionType && <span className="px-2 py-0.5 bg-crayon-yellow/30 rounded-full text-xs font-medium">卡点：{question.confusionType}</span>}
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.className}`}>{statusBadge.label}</span>
          </div>
          <h1 className="text-xl font-bold text-ink mb-2">{question.title}</h1>
          {question.imageUrl && <a href={question.imageUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue text-sm underline">📷 查看题目图片</a>}
          {question.recognizedText && <div className="mt-3 p-3 rounded-xl bg-paper text-sm text-ink-light whitespace-pre-wrap">{question.recognizedText}</div>}
          <p className="text-ink-light leading-relaxed whitespace-pre-wrap mt-3">{question.content}</p>
          <p className="text-xs text-ink-light mt-3">提问人：{question.isAnonymous ? "匿名小朋友" : question.author.name || "小朋友"}</p>
          <div className="mt-4 border-t border-ink/10 pt-3 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-ink-light max-w-xl">{heatPrompt.helper}</p>
            <button onClick={handleHeat} disabled={heating} className="hand-btn hand-btn-white text-xs disabled:opacity-50">🔥 {heating ? "记录中..." : heatPrompt.label}</button>
          </div>
        </div>

        {question.status === "OPEN" && !isClaimedByMe && (
          <div className="sticker bg-crayon-yellow text-center mb-6">
            <p className="text-ink font-medium mb-1">🎯 这道题等待小讲师认领</p>
            <p className="text-xs text-ink-light mb-3">认领后有72小时上传讲解；如果超时，题目会重新开放。</p>
            <button onClick={handleClaim} disabled={claiming} className="hand-btn bg-crayon-green text-ink disabled:opacity-50">{claiming ? "认领中..." : "🙋 认领这道题"}</button>
          </div>
        )}

        {question.status === "CLAIMED" && (
          <div className="sticker bg-crayon-blue/20 mb-6">
            <p className="text-sm font-bold text-ink">⏳ {claimCopy.label}</p>
            <p className="text-xs text-ink-light mt-1">{claimCopy.helper}</p>
            {question.claimedBy && <p className="text-xs text-ink-light mt-1">当前小讲师：{question.claimedBy.name || "小讲师"}</p>}
          </div>
        )}

        {isClaimedByMe && (
          <div className="sticker bg-crayon-blue mb-6">
            <h3 className="font-bold text-ink mb-1">🎤 提交你的讲题视频</h3>
            <p className="text-xs text-ink-light mb-3">{getAnswerSubmitPrompt(answerShareScope)}</p>
            <form onSubmit={handleSubmitAnswer} className="space-y-4">
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setVideoFile(file);
                  if (!file) setVideoUrl("");
                }}
                required={!videoUrl}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none"
              />
              {videoFile && <p className="text-xs text-ink-light">已选择：{videoFile.name}，提交时会先上传视频。</p>}
              {videoUrl && <p className="text-xs text-ink-light">视频已上传：{videoUrl}</p>}
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-white focus:border-crayon-green focus:outline-none resize-none" placeholder="简单说说你的讲解思路..." />
              <div className="space-y-2">
                {QUESTION_SHARE_OPTIONS.map((option) => (
                  <label key={option.value} className="flex gap-2 items-start text-xs text-ink cursor-pointer">
                    <input type="radio" name="answerShareScope" value={option.value} checked={answerShareScope === option.value} onChange={(e) => setAnswerShareScope(e.target.value)} />
                    <span>{option.label} <span className="text-ink-light">— {option.parentNote}</span></span>
                  </label>
                ))}
              </div>
              <button type="submit" disabled={submitting} className="hand-btn w-full bg-white text-ink disabled:opacity-50">{uploadingVideo ? "上传讲题视频中..." : submitting ? "提交中..." : "✅ 提交讲题视频，等待老师审核"}</button>
            </form>
          </div>
        )}

        {question.answers.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-ink mb-3">🎭 讲题回答</h3>
            {question.answers.map((answer) => (
              <div key={answer.id} className="sticker bg-white mb-3">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-sm font-medium text-ink">{answer.lecturer.name || "小讲师"}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${answer.reviewStatus === "APPROVED" || answer.status === "APPROVED" ? "bg-crayon-green/30" : "bg-crayon-yellow/30"}`}>{answer.reviewStatus === "APPROVED" || answer.status === "APPROVED" ? "老师已审核" : "等待老师审核"}</span>
                  {answer.shareScope === "PUBLIC_HALL" && <span className="px-2 py-0.5 rounded-full text-xs bg-crayon-blue/20">授权公开</span>}
                </div>
                {answer.videoUrl && <a href={answer.videoUrl} target="_blank" rel="noopener noreferrer" className="text-crayon-blue hover:underline text-sm">📹 观看讲题视频</a>}
                {answer.description && <p className="text-sm text-ink-light mt-1">{answer.description}</p>}
                {session?.user?.id === question.authorId && answer.status === "PENDING" && question.status !== "RESOLVED" && (
                  <button
                    onClick={async () => {
                      if (!confirm("确认采纳这个回答？采纳后会给小讲师记录私密讲解成长能量。")) return;
                      const res = await fetch(`/math-young-lecturer/api/answers/${answer.id}/approve`, { method: "POST" });
                      const data = await res.json().catch(() => ({}));
                      if (res.ok) { setMessage(data.growthEnergy?.userMessage || "采纳成功，小讲师会收到讲解成长能量。"); loadQuestion(); } else { setMessage(data.error || "采纳失败"); }
                    }}
                    className="hand-btn hand-btn-green text-xs mt-3"
                  >
                    ✅ 采纳这个讲解
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
