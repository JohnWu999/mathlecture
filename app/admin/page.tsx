"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import { getProjectAccessPackageOptions } from "@/lib/admin-teacher-workspace-rules.mjs";
import { getAdminDataWorkbenchSections } from "@/lib/role-workspace-completeness-rules.mjs";
import { getRegistrationFollowUpOptions, getFollowUpStatusLabel } from "@/lib/registration-followup-rules.mjs";

type ProjectAccess = { id: string; packageType: string; status: string; quotaTotal?: number | null; quotaUsed?: number | null; validUntil?: string | null; note?: string | null; project?: { id?: string; title: string } | null };
type AdminUser = { id: string; name?: string | null; phone?: string | null; role: string; grade?: string | number | null; region?: string | null; isActive: boolean; projectAccesses?: ProjectAccess[] };
type WorkbenchData = {
  counts?: Record<string, number>;
  projects?: any[];
  questions?: any[];
  lectureVideos?: any[];
  projectArtifacts?: any[];
  paymentRecords?: any[];
  auditLogs?: any[];
  registrationIntents?: any[];
};

const money = (amount?: number | null) => `¥${((amount || 0) / 100).toFixed(2)}`;
const dateText = (value?: string | null) => value ? new Date(value).toLocaleDateString() : "—";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [workbench, setWorkbench] = useState<WorkbenchData>({});
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [packageType, setPackageType] = useState("FIVE_SESSION_PACK");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const options = useMemo(() => getProjectAccessPackageOptions(), []);
  const sections = useMemo(() => getAdminDataWorkbenchSections(), []);
  const students = users.filter((user) => user.role === "STUDENT");

  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    fetchAll();
  }, [status, session?.user?.role]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, workbenchRes] = await Promise.all([
        fetch("/math-young-lecturer/api/admin/users"),
        fetch("/math-young-lecturer/api/admin/workbench"),
      ]);
      const usersData = await usersRes.json().catch(() => []);
      const workbenchData = await workbenchRes.json().catch(() => ({}));
      if (!usersRes.ok) throw new Error(usersData.error || "用户数据加载失败");
      if (!workbenchRes.ok) throw new Error(workbenchData.error || "后台数据库加载失败");
      setUsers(usersData);
      setWorkbench(workbenchData);
      if (!selectedUserId && usersData.length > 0) {
        const firstStudent = usersData.find((user: AdminUser) => user.role === "STUDENT") || usersData[0];
        setSelectedUserId(firstStudent.id);
      }
    } catch (error: any) {
      setNotice(error.message || "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const openProjectAccess = async () => {
    if (!selectedUserId || !packageType) {
      setNotice("请先选择学生和项目权限类型");
      return;
    }
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/math-young-lecturer/api/admin/project-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, packageType, paymentAmount, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "开通失败");
      setNotice(data.message || "项目权限已开通");
      setNote("");
      setPaymentAmount(0);
      await fetchAll();
    } catch (error: any) {
      setNotice(error.message || "开通失败");
    } finally {
      setSaving(false);
    }
  };

  const updateRegistrationFollowUp = async (registrationId: string, followUpStatus: string, followUpNote: string) => {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch(`/math-young-lecturer/api/admin/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpStatus, note: followUpNote }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "更新失败");
      setNotice(data.message || "报名意向跟进状态已更新");
      await fetchAll();
    } catch (error: any) {
      setNotice(error.message || "更新失败");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <main className="min-h-screen"><Navbar /><div className="text-center py-20 text-ink-light">加载中...</div></main>;
  if (!session?.user) return <main className="min-h-screen"><Navbar /><div className="text-center py-20 text-ink-light">请先登录</div></main>;
  if (session.user.role !== "ADMIN") return <main className="min-h-screen"><Navbar /><div className="text-center py-20"><div className="text-4xl mb-3">🚫</div><p className="text-ink font-medium">无权访问管理员工作台</p><p className="text-ink-light text-sm mt-1">老师工作台负责教学审核；项目包、付费权益和用户运营由管理员处理。</p></div></main>;

  const countCards = [
    { label: "学习者", value: students.length, icon: "👧", color: "sticker-blue" },
    { label: "老师/管理员", value: users.filter((u) => u.role !== "STUDENT").length, icon: "👩‍🏫", color: "sticker-green" },
    { label: "项目", value: workbench.counts?.projects ?? 0, icon: "🎯", color: "sticker-yellow" },
    { label: "问题", value: workbench.counts?.questions ?? 0, icon: "🙋", color: "sticker-pink" },
    { label: "视频", value: workbench.counts?.lectureVideos ?? 0, icon: "🎤", color: "sticker-blue" },
    { label: "作品", value: workbench.counts?.projectArtifacts ?? 0, icon: "🧩", color: "sticker-green" },
    { label: "报名意向", value: workbench.counts?.registrationIntents ?? 0, icon: "📮", color: "sticker-yellow" },
  ];

  return (
    <main className="min-h-screen">
      <Navbar />
      <section className="px-6 pt-8 pb-16 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-ink handwritten-title">🛠️ 管理员工作台</h1>
          <p className="text-ink-light text-sm">严格按三身份设计：学习者看个人成长护照，老师做教学审核，管理员管理全站数据库、项目包、付费与审计。</p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
          {countCards.map((card) => <div key={card.label} className={`sticker ${card.color} text-center py-5`}><div className="text-2xl mb-1">{card.icon}</div><p className="text-2xl font-bold text-ink handwritten-title">{card.value}</p><p className="text-xs text-ink-light">{card.label}</p></div>)}
        </div>
        {notice && <div className="sticker bg-crayon-green/20 mb-8 text-sm text-ink">{notice}</div>}

        <section className="sticker sticker-white mb-8">
          <h2 className="font-bold text-ink mb-3">🧭 后台模块总览</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {sections.map((section) => <div key={section.key} className="rounded-2xl bg-paper border border-ink/5 p-3"><p className="text-sm font-bold text-ink">{section.label}</p><p className="text-xs text-ink-light mt-1 leading-relaxed">{section.helper}</p></div>)}
          </div>
        </section>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6 mb-8">
          <div className="sticker sticker-white">
            <h2 className="font-bold text-ink mb-2">🎟️ 项目权限与项目包</h2>
            <p className="text-xs text-ink-light mb-4">5 次项目、20 周项目、指定项目等商业权益只在管理员后台开通。</p>
            <label className="block text-sm font-medium text-ink mb-1">选择学生</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} className="w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 mb-3">
              {students.map((user) => <option key={user.id} value={user.id}>{user.name || "未命名"} · {user.phone || "未留手机"}</option>)}
            </select>
            <label className="block text-sm font-medium text-ink mb-1">项目权限类型</label>
            <select value={packageType} onChange={(e) => setPackageType(e.target.value)} className="w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 mb-3">
              {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <p className="text-xs text-ink-light mb-3">{options.find((option) => option.value === packageType)?.helper}</p>
            <label className="block text-sm font-medium text-ink mb-1">付费金额（分，可为 0）</label>
            <input type="number" min="0" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value || 0))} className="w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 mb-3" />
            <label className="block text-sm font-medium text-ink mb-1">备注</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-ink/20 bg-paper px-3 py-2 mb-4 min-h-20" placeholder="例如：线下已收款，开通 5 次项目包。" />
            <button onClick={openProjectAccess} disabled={saving || !selectedUserId} className="hand-btn hand-btn-yellow text-sm disabled:opacity-50">{saving ? "开通中..." : "确认开通项目权限"}</button>
          </div>

          <div className="sticker sticker-white max-h-[560px] overflow-auto">
            <h2 className="font-bold text-ink mb-3">👤 用户与权益数据库</h2>
            {loading ? <div className="text-center py-10 text-ink-light">加载中...</div> : users.map((user) => (
              <div key={user.id} className="rounded-2xl bg-paper border border-ink/5 p-3 mb-3">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="font-bold text-ink">{user.name || "未命名"}</p><p className="text-xs text-ink-light">{user.phone || "未留手机"} · {user.role}{user.grade && ` · ${user.grade}年级`} · 基础参与：{user.isActive ? "已开放" : "已暂停"}</p></div>
                  <span className="text-xs px-2 py-1 rounded-full bg-white border border-ink/10">{user.projectAccesses?.length || 0} 条权益</span>
                </div>
                {(user.projectAccesses || []).slice(0, 3).map((access) => <p key={access.id} className="text-xs text-ink-light mt-2">🎟️ {options.find((option) => option.value === access.packageType)?.label || access.packageType} · {access.status} · {access.quotaTotal == null ? "按周期/不限次" : `${access.quotaUsed || 0}/${access.quotaTotal}`}</p>)}
              </div>
            ))}
          </div>
        </div>

        <section className="grid lg:grid-cols-2 gap-6">
          <DatabaseCard title="🎯 项目管理数据库" helper="项目标题、类型、状态、知识标签、价格、有效期、报名/小组/作品/权益数量。">
            {(workbench.projects || []).map((p) => <Row key={p.id} title={p.title} meta={`${p.projectType} · ${p.status} · ${money(p.price)} · 报名${p._count?.registrations || 0} · 小组${p._count?.groups || 0} · 作品${p._count?.projectArtifacts || 0}`} note={(p.knowledgeTags || []).join("、") || `有效至 ${dateText(p.validUntil)}`} />)}
          </DatabaseCard>
          <DatabaseCard title="📮 报名意向库" helper="报名不再直接确认；管理员在这里查看孩子昵称、年级、项目包、联系方式，并更新人工跟进状态。">
            {(workbench.registrationIntents || []).map((r) => (
              <RegistrationIntentRow key={r.id} intent={r} saving={saving} onSave={updateRegistrationFollowUp} />
            ))}
          </DatabaseCard>
          <DatabaseCard title="🙋 提问者问题数据库" helper="问题、年级、知识点、困惑类型、审核状态、认领状态、热度与回答数。">
            {(workbench.questions || []).map((q) => <Row key={q.id} title={q.title} meta={`${q.author?.name || "匿名"} · ${q.grade || "—"}年级 · ${q.topic || "未标知识点"} · ${q.reviewStatus}/${q.status}`} note={`困惑：${q.confusionType || "未填"} · 热度${q.heatCount || 0} · 回答${q._count?.answers || 0} · 认领：${q.claimedBy?.name || "未认领"}`} />)}
          </DatabaseCard>
          <DatabaseCard title="🎤 小讲师视频数据库" helper="讲题视频、关联问题、讲师、审核状态、清晰度标签、分享授权与老师小贴士。">
            {(workbench.lectureVideos || []).map((a) => <Row key={a.id} title={a.question?.title || "未关联问题"} meta={`${a.lecturer?.name || "未命名"} · ${a.status}/${a.reviewStatus} · ${a.shareScope}`} note={`${(a.clarityTags || []).join("、") || "暂无能力标签"}${a.mathTip ? ` · 小贴士：${a.mathTip}` : ""}`} />)}
          </DatabaseCard>
          <DatabaseCard title="🧩 项目作品数据库" helper="项目作品、协作小组、作者、审核状态、公开授权、撤回记录。">
            {(workbench.projectArtifacts || []).map((item) => <Row key={item.id} title={item.title} meta={`${item.project?.title || "未关联项目"} · ${item.group?.name || "未关联小组"} · ${item.reviewStatus}/${item.shareScope}`} note={`作者：${item.author?.name || "未命名"} · 授权：${dateText(item.authorizedAt)} · 撤回：${dateText(item.withdrawnAt)}`} />)}
          </DatabaseCard>
          <DatabaseCard title="💳 付款/退费/延期/转期记录" helper="管理员手工登记财务与运营动作，和项目权益记录分离但可审计。">
            {(workbench.paymentRecords || []).map((r) => <Row key={r.id} title={`${r.user?.name || "未命名"} · ${r.recordType}`} meta={`${money(r.amount)} · ${r.status} · ${r.project?.title || "未关联项目"}`} note={`经办：${r.operator?.name || "—"} · ${dateText(r.createdAt)}${r.note ? ` · ${r.note}` : ""}`} />)}
          </DatabaseCard>
          <DatabaseCard title="🧾 导出与审计日志" helper="记录后台敏感操作，后续批量导出也必须进入审计。">
            {(workbench.auditLogs || []).map((log) => <Row key={log.id} title={log.action} meta={`${log.targetType} · ${log.targetId || "—"}`} note={`操作者：${log.operator?.name || "—"} · ${dateText(log.createdAt)}`} />)}
          </DatabaseCard>
        </section>
      </section>
    </main>
  );
}

function DatabaseCard({ title, helper, children }: { title: string; helper: string; children: React.ReactNode }) {
  return <div className="sticker sticker-white min-h-[280px]"><h2 className="font-bold text-ink mb-1">{title}</h2><p className="text-xs text-ink-light mb-4 leading-relaxed">{helper}</p><div className="space-y-3 max-h-80 overflow-auto">{children || <p className="text-sm text-ink-light">暂无数据</p>}</div></div>;
}

function RegistrationIntentRow({ intent, saving, onSave }: { intent: any; saving: boolean; onSave: (id: string, status: string, note: string) => void }) {
  const [status, setStatus] = useState(intent.followUpStatus || "PENDING");
  const [note, setNote] = useState(intent.note || "");
  const options = getRegistrationFollowUpOptions();

  useEffect(() => {
    setStatus(intent.followUpStatus || "PENDING");
    setNote(intent.note || "");
  }, [intent.id, intent.followUpStatus, intent.note]);

  return (
    <div className="rounded-2xl bg-paper border border-ink/5 p-3">
      <p className="text-sm font-bold text-ink truncate">{intent.childName || intent.user?.name || "未命名孩子"} · {intent.project?.title || "未关联项目"}</p>
      <p className="text-xs text-ink-light mt-1">报名：{intent.status} · 跟进：{getFollowUpStatusLabel(intent.followUpStatus || "PENDING")} · {intent.grade || "—"}年级 · {intent.packageName || "项目报名意向"}</p>
      <p className="text-xs text-ink-light mt-1 line-clamp-2">家长/账号：{intent.user?.name || "—"} · 联系方式：{intent.contact || intent.user?.phone || "未留"}</p>
      <div className="mt-3 grid gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink">
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink min-h-16" placeholder="跟进备注：例如已加企业微信、约定沟通时间、暂缓原因。" />
        <button onClick={() => onSave(intent.id, status, note)} disabled={saving} className="hand-btn hand-btn-blue text-xs disabled:opacity-50">{saving ? "保存中..." : "保存跟进状态"}</button>
      </div>
    </div>
  );
}

function Row({ title, meta, note }: { title: string; meta: string; note?: string }) {
  return <div className="rounded-2xl bg-paper border border-ink/5 p-3"><p className="text-sm font-bold text-ink truncate">{title}</p><p className="text-xs text-ink-light mt-1">{meta}</p>{note && <p className="text-xs text-ink-light mt-1 line-clamp-2">{note}</p>}</div>;
}
