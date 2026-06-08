"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  CONFUSION_OPTIONS,
  GRADE_TOPIC_OPTIONS,
  QUESTION_FORM_STEPS,
  QUESTION_SHARE_OPTIONS,
} from "@/lib/qa-ui-rules.mjs";

export default function AskPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [suggestedTitle, setSuggestedTitle] = useState("");
  const [content, setContent] = useState("");
  const [recognizedText, setRecognizedText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [grade, setGrade] = useState("1");
  const [topic, setTopic] = useState("20以内加减法");
  const [customTopic, setCustomTopic] = useState("");
  const [confusionType, setConfusionType] = useState("看不懂题意");
  const [shareScope, setShareScope] = useState("QUESTION_AUTHOR_ONLY");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const topicOptions = GRADE_TOPIC_OPTIONS[grade as keyof typeof GRADE_TOPIC_OPTIONS] || [];
  const finalTopic = topic === "其他" ? customTopic : topic;

  const generatedTitle = useMemo(() => {
    const text = recognizedText || content;
    if (!text.trim()) return "";
    const shortText = text.trim().replace(/\s+/g, "").slice(0, 14);
    return `${grade}年级${finalTopic || "数学"}：${shortText}怎么想？`;
  }, [recognizedText, content, grade, finalTopic]);

  const applySuggestedTitle = () => {
    const next = generatedTitle || suggestedTitle;
    setSuggestedTitle(next);
    setTitle(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setError("请先登录。登录后，我们才能把这个问题放进你的成长记录里。");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      let finalImageUrl = imageUrl;
      if (imageFile) {
        setUploadingImage(true);
        const uploadForm = new FormData();
        uploadForm.append("kind", "question-image");
        uploadForm.append("file", imageFile);
        const uploadRes = await fetch("/math-young-lecturer/api/uploads", {
          method: "POST",
          body: uploadForm,
        });
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (!uploadRes.ok) throw new Error(uploadData.error || "题目照片上传失败");
        finalImageUrl = uploadData.url;
        setImageUrl(finalImageUrl);
      }
      const res = await fetch("/math-young-lecturer/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          suggestedTitle: suggestedTitle || generatedTitle || title,
          content,
          recognizedText,
          imageUrl: finalImageUrl,
          grade: parseInt(grade),
          topic: finalTopic,
          confusionType,
          shareScope,
          isAnonymous,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "提问失败");

      setSuccessMessage(data.growthPrompt || "谢谢你把问题说出来。老师看过后，小讲师就可以来认领讲解。");
      setTimeout(() => {
        router.push("/qa");
        router.refresh();
      }, 900);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <main className="forest-page-shell">
      <Navbar />
      <section className="forest-page-content forest-page-content-narrow">
        <div className="forest-page-hero text-center">
          <div className="inline-block sticker bg-crayon-yellow mb-3"><span className="text-3xl">🌱</span></div>
          <h1 className="forest-page-title handwritten-title infinity-title">我要提问</h1>
          <p className="text-ink-light mt-1">谢谢你把问题说出来。这里是问题种子站：先保护孩子的表达，再交给老师审核。</p>
        </div>

        <div className="forest-card-grid four mb-6">
          {QUESTION_FORM_STEPS.map((step, index) => (
            <div key={step.key} className="forest-mission-card">
              <p className="text-xs font-bold text-ink">{index + 1}. {step.title}</p>
              <p className="text-[11px] text-ink-light mt-1 leading-relaxed">{step.helper}</p>
            </div>
          ))}
        </div>

        <div className="forest-panel">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="px-4 py-2 bg-crayon-pink/50 rounded-lg text-sm text-ink">{error}</div>}
            {successMessage && <div className="px-4 py-2 bg-crayon-green/30 rounded-lg text-sm text-ink">{successMessage}</div>}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">上传题目照片</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setImageFile(file);
                  if (!file) setImageUrl("");
                }}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none"
              />
              {imageFile && <p className="text-xs text-ink-light mt-1">已选择：{imageFile.name}，提交时会先上传照片。</p>}
              {imageUrl && <p className="text-xs text-ink-light mt-1">照片已上传：{imageUrl}</p>}
              <p className="text-xs text-ink-light mt-1">拍照上传是为了让小讲师看清题目，不会公开未审核内容。</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">题目识别文字 / 手动补充</label>
              <textarea value={recognizedText} onChange={(e) => setRecognizedText(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none resize-none" placeholder="可以把题目文字写在这里，方便老师审核和小讲师理解。" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink mb-1">年级</label>
                <select value={grade} onChange={(e) => { setGrade(e.target.value); setTopic((GRADE_TOPIC_OPTIONS as any)[e.target.value][0]); }} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none">
                  <option value="1">一年级</option><option value="2">二年级</option><option value="3">三年级</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink mb-1">知识点</label>
                <select value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none">
                  {topicOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
            </div>

            {topic === "其他" && (
              <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none" placeholder="请家长或孩子补充一个简短知识点" />
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-1">系统建议标题 + 家长/孩子确认</label>
              <div className="flex gap-2">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="flex-1 px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none" placeholder="例如：这道表内乘法题怎么想？" />
                <button type="button" onClick={applySuggestedTitle} className="hand-btn hand-btn-yellow text-xs">用建议标题</button>
              </div>
              {generatedTitle && <p className="text-xs text-ink-light mt-1">建议：{generatedTitle}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">我卡在哪里</label>
              <select value={confusionType} onChange={(e) => setConfusionType(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none">
                {CONFUSION_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1">问题描述</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} required rows={4} className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-green focus:outline-none resize-none" placeholder="你可以说：哪一步看不懂？你已经试过什么方法？" />
            </div>

            <div className="space-y-3">
              <p className="text-sm font-medium text-ink">分享范围</p>
              {QUESTION_SHARE_OPTIONS.map((option) => (
                <label key={option.value} className="block sticker sticker-white p-3 cursor-pointer border-2 border-ink/10">
                  <div className="flex gap-2 items-start">
                    <input type="radio" name="shareScope" value={option.value} checked={shareScope === option.value} onChange={(e) => setShareScope(e.target.value)} className="mt-1" />
                    <div>
                      <p className="text-sm font-bold text-ink">{option.label}</p>
                      <p className="text-xs text-ink-light mt-1">{option.childNote}</p>
                      <p className="text-[11px] text-ink-light mt-1">家长说明：{option.parentNote}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 rounded border-ink/30 text-crayon-green focus:ring-crayon-green" />
              <span className="text-sm text-ink-light">匿名提问（保护提问安全感）</span>
            </label>

            <button type="submit" disabled={loading} className="hand-btn w-full bg-crayon-green text-ink disabled:opacity-50">
              {uploadingImage ? "上传题目照片中..." : loading ? "提交给老师审核中..." : "✅ 提交问题，等待老师审核"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
