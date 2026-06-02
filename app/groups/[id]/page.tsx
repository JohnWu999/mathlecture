"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import {
  PROJECT_COLLAB_COPY,
  PROJECT_MESSAGE_TYPES,
  buildProjectTaskCards,
  buildTypedMessageContent,
  getActiveTaskCard,
  getAiBoundaryCopy,
  getProjectCollabGrowthPrompt,
  getProjectFeedbackPrompt,
  getProjectMessageType,
  getProjectSubmissionPrompt,
} from "@/lib/project-collab-ui-rules.mjs";

interface Message {
  id: string;
  content: string;
  audioUrl: string | null;
  createdAt: string;
  author: { name: string | null };
}

interface GroupInfo {
  id: string;
  name: string;
  dayProgress: number;
  project: {
    id: string;
    title: string;
    durationDays: number;
    knowledgeTags: string[];
    projectType: "FREE" | "PAID";
  };
  _count: { members: number };
}

export default function GroupPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [group, setGroup] = useState<GroupInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageType, setMessageType] = useState("DISCUSSION");
  const [newMessage, setNewMessage] = useState("");
  const [artifactUrl, setArtifactUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchSpace = () => {
    fetch(`/math-young-lecturer/api/groups/${id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setGroup(data.group || null);
          setMessages(Array.isArray(data.messages) ? data.messages : []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSpace();
    const interval = setInterval(fetchSpace, 15000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const taskCards = useMemo(() => buildProjectTaskCards({
    durationDays: group?.project.durationDays || 5,
    dayProgress: group?.dayProgress || 1,
  }), [group]);
  const activeTask = getActiveTaskCard(taskCards);
  const selectedType = getProjectMessageType(messageType);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setSending(true);
    setNotice("");
    try {
      const content = buildTypedMessageContent({ type: messageType, text: newMessage, artifactUrl });
      const res = await fetch(`/math-young-lecturer/api/groups/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setNewMessage("");
        setArtifactUrl("");
        setNotice(data.childMessage || "协作记录已留下。");
        fetchSpace();
      } else {
        setNotice(data.error || "发送失败，请稍后再试。");
      }
    } catch (e) {
      setNotice("发送失败，请稍后再试。");
    }
    setSending(false);
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const isMyMessage = (msg: Message) => msg.author.name === session?.user?.name;

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <section className="flex-1 max-w-6xl mx-auto w-full px-4 pt-6 pb-8">
        <div className="sticker bg-crayon-blue mb-5 text-center">
          <p className="text-xs text-ink-light">{group?.project.title || "项目小组"}</p>
          <h1 className="text-2xl font-bold text-ink">👥 {PROJECT_COLLAB_COPY.title}</h1>
          <p className="text-sm text-ink-light mt-2">{PROJECT_COLLAB_COPY.subtitle}</p>
          <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs">
            <span className="px-3 py-1 rounded-full bg-white/70">{group?.name || "小组"}</span>
            <span className="px-3 py-1 rounded-full bg-white/70">{group?._count.members || 0} 位成员</span>
            <span className="px-3 py-1 rounded-full bg-white/70">Day {group?.dayProgress || 1} / {group?.project.durationDays || 5}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-5">
          <aside className="space-y-5">
            <div className="sticker bg-white">
              <h2 className="font-bold text-ink mb-3">🗂️ 项目任务卡</h2>
              <div className="space-y-2">
                {taskCards.map((card) => (
                  <div key={card.day} className={`rounded-2xl p-3 border ${card.status === "active" ? "bg-crayon-yellow/35 border-ink/20" : "bg-parchment/60 border-ink/10"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold text-sm text-ink">{card.title}</p>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-white/80 text-ink-light">{card.statusLabel}</span>
                    </div>
                    <p className="text-xs text-ink-light mt-1 leading-relaxed">{card.childAction}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticker bg-crayon-green/60">
              <h2 className="font-bold text-ink mb-2">🌿 今天的探索重点</h2>
              <p className="text-sm text-ink-light leading-relaxed">{activeTask?.childAction}</p>
              <p className="text-xs text-ink-light mt-3">{getProjectCollabGrowthPrompt()}</p>
            </div>

            <div className="sticker bg-white">
              <h2 className="font-bold text-ink mb-2">🤖 AI 使用边界</h2>
              <p className="text-sm text-ink-light leading-relaxed">{getAiBoundaryCopy()}</p>
            </div>
          </aside>

          <div className="space-y-5">
            <div className="sticker bg-white">
              <h2 className="font-bold text-ink mb-3">✍️ 留下协作记录</h2>
              <div className="grid sm:grid-cols-4 gap-2 mb-3">
                {PROJECT_MESSAGE_TYPES.map((type) => (
                  <button
                    key={type.type}
                    type="button"
                    onClick={() => setMessageType(type.type)}
                    className={`rounded-2xl px-3 py-2 text-left border ${messageType === type.type ? "bg-crayon-yellow/40 border-ink/25" : "bg-parchment/50 border-ink/10"}`}
                  >
                    <div className="text-lg">{type.emoji}</div>
                    <div className="text-xs font-bold text-ink">{type.label}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-ink-light mb-3">{selectedType.helper}</p>
              {messageType === "SUBMISSION" && <p className="text-xs text-ink-light mb-3">{getProjectSubmissionPrompt()}</p>}
              {messageType === "REFLECTION" && <p className="text-xs text-ink-light mb-3">{getProjectFeedbackPrompt()}</p>}

              {session?.user ? (
                <form onSubmit={handleSend} className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="用孩子自己的话写下观察、讨论、作品说明或反馈..."
                    className="w-full min-h-[92px] px-4 py-3 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-blue focus:outline-none transition-colors text-sm"
                  />
                  {(messageType === "EVIDENCE" || messageType === "SUBMISSION") && (
                    <input
                      type="url"
                      value={artifactUrl}
                      onChange={(e) => setArtifactUrl(e.target.value)}
                      placeholder="可选：粘贴照片、视频、海报或作品链接"
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-blue focus:outline-none transition-colors text-sm"
                    />
                  )}
                  <button type="submit" disabled={sending || !newMessage.trim()} className="hand-btn bg-crayon-blue text-ink disabled:opacity-50 px-5">
                    {sending ? "记录中..." : `提交${selectedType.label}`}
                  </button>
                  {notice && <p className="text-sm text-ink-light">{notice}</p>}
                </form>
              ) : (
                <div className="text-center py-3 text-sm text-ink-light">请先登录后留下项目协作记录</div>
              )}
            </div>

            <div className="sticker bg-white">
              <h2 className="font-bold text-ink mb-3">💬 小组留言流 / 过程记录</h2>
              <p className="text-xs text-ink-light mb-3">{PROJECT_COLLAB_COPY.safetyNote}</p>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-12 text-ink-light">加载协作记录中...</div>
                ) : messages.length === 0 ? (
                  <div className="sticker bg-parchment text-center py-8">
                    <div className="text-3xl mb-2">💬</div>
                    <p className="text-ink-light text-sm">{PROJECT_COLLAB_COPY.empty}</p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <div key={msg.id} className={`flex ${isMyMessage(msg) ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[82%] px-4 py-2.5 rounded-2xl sticker ${isMyMessage(msg) ? "bg-crayon-green" : "bg-parchment"}`}>
                        {!isMyMessage(msg) && <p className="text-xs font-medium text-ink mb-1">{msg.author.name || "小伙伴"}</p>}
                        <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                        <p className="text-[10px] text-ink-light mt-1 text-right">{formatTime(msg.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={bottomRef} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
