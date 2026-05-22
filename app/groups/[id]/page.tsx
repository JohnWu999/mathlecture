"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";

interface Message {
  id: string;
  content: string;
  audioUrl: string | null;
  createdAt: string;
  author: { name: string | null };
}

export default function GroupPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch(`/math-young-lecturer/api/groups/${id}/messages`)
      .then((r) => r.json())
      .then((data) => {
        setMessages(data);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // 每10秒轮询
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session?.user) return;

    setSending(true);
    try {
      const res = await fetch(`/math-young-lecturer/api/groups/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
      }
    } catch (e) {
      console.error("发送失败", e);
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
      <section className="flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 pt-4 pb-4">
        {/* 标题 */}
        <div className="sticker bg-crayon-blue mb-4 text-center">
          <h1 className="text-lg font-bold text-ink">👥 小组协作空间</h1>
          <p className="text-xs text-ink-light">一起讨论、分享想法、解决问题！</p>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-4 min-h-[300px]">
          {loading ? (
            <div className="text-center py-12 text-ink-light">加载消息中...</div>
          ) : messages.length === 0 ? (
            <div className="sticker bg-white text-center py-8">
              <div className="text-3xl mb-2">💬</div>
              <p className="text-ink-light text-sm">还没有消息，发起第一条吧！</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${isMyMessage(msg) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl sticker ${
                    isMyMessage(msg)
                      ? "bg-crayon-green"
                      : "bg-white"
                  }`}
                >
                  {!isMyMessage(msg) && (
                    <p className="text-xs font-medium text-ink mb-1">
                      {msg.author.name || "小伙伴"}
                    </p>
                  )}
                  <p className="text-sm text-ink leading-relaxed">{msg.content}</p>
                  <p className="text-[10px] text-ink-light mt-1 text-right">
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* 发送框 */}
        {session?.user ? (
          <form onSubmit={handleSend} className="sticker bg-white flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="输入消息..."
              className="flex-1 px-4 py-2.5 rounded-xl border-2 border-ink/15 bg-paper focus:border-crayon-blue focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="hand-btn bg-crayon-blue text-ink disabled:opacity-50 px-5"
            >
              {sending ? "..." : "发送"}
            </button>
          </form>
        ) : (
          <div className="sticker bg-white text-center py-3 text-sm text-ink-light">
            请先登录后发言
          </div>
        )}
      </section>
    </main>
  );
}
