"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/navbar";
import { getProjectAccessPackageOptions } from "@/lib/admin-teacher-workspace-rules.mjs";
import { getAdminDataWorkbenchSections } from "@/lib/role-workspace-completeness-rules.mjs";
import { getRegistrationFollowUpOptions, getFollowUpStatusLabel } from "@/lib/registration-followup-rules.mjs";
import { buildAccessTodoFromRegistration } from "@/lib/project-access-linkage-rules.mjs";

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
  const [consultationConfig, setConsultationConfig] = useState<{ settings?: any[]; projects?: any[] }>({});

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
      const [usersRes, workbenchRes, consultationRes] = await Promise.all([
        fetch("/math-young-lecturer/api/admin/users"),
        fetch("/math-young-lecturer/api/admin/workbench"),
        fetch("/math-young-lecturer/api/admin/consultation-settings"),
      ]);
      const usersData = await usersRes.json().catch(() => []);
      const workbenchData = await workbenchRes.json().catch(() => ({}));
      const consultationData = await consultationRes.json().catch(() => ({}));
      if (!usersRes.ok) throw new Error(usersData.error || "用户数据加载失败");
      if (!workbenchRes.ok) throw new Error(workbenchData.error || "后台数据库加载失败");
      if (!consultationRes.ok) throw new Error(consultationData.error || "咨询配置加载失败");
      setUsers(usersData);
      setWorkbench(workbenchData);
      setConsultationConfig(consultationData);
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

  const updateRegistrationFollowUp = async (registrationId: string, followUpStatus: string, followUpNote: string, openProjectAccess = false) => {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch(`/math-young-lecturer/api/admin/registrations/${registrationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followUpStatus, note: followUpNote, openProjectAccess }),
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

  const saveConsultationSetting = async (payload: any) => {
    setSaving(true);
    setNotice("");
    try {
      const res = await fetch("/math-young-lecturer/api/admin/consultation-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "保存失败");
      setNotice(data.message || "咨询入口配置已保存");
      await fetchAll();
    } catch (error: any) {
      setNotice(error.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <main className="forest-page-shell forest-workspace-shell"><Navbar /><div className="text-center py-20 text-ink-light">加载中...</div></main>;
  if (!session?.user) return <main className="forest-page-shell forest-workspace-shell"><Navbar /><div className="text-center py-20 text-ink-light">请先登录</div></main>;
  if (session.user.role !== "ADMIN") return <main className="forest-page-shell forest-workspace-shell"><Navbar /><div className="text-center py-20"><span className="forest-v2-icon forest-icon-question mx-auto mb-3" aria-hidden="true" /><p className="text-ink font-medium">无权访问管理员工作台</p><p className="text-ink-light text-sm mt-1">老师工作台负责教学审核；项目包、付费权益和用户运营由管理员处理。</p></div></main>;

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
    <main className="forest-page-shell forest-workspace-shell">
      <Navbar />
      <section className="forest-page-content forest-workspace-content" style={{ width: "min(1320px, calc(100% - 32px))" }}>
        <div className="forest-page-hero forest-workspace-hero">
          <span className="forest-page-eyebrow">守林人工作台｜管理员</span>
          <h1 className="forest-page-title">管理员工作台</h1>
          <p className="forest-page-subtitle">严格按三身份设计：学习者看个人成长护照，老师做教学审核，管理员管理全站数据库、项目包、付费与审计。</p>
        </div>

        <div className="grid md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8 forest-card-grid four">
          {countCards.map((card) => <div key={card.label} className={`forest-dashboard-card ${card.color} text-center py-5`}><div className="text-2xl mb-1">{card.icon}</div><p className="text-2xl font-bold text-ink handwritten-title">{card.value}</p><p className="text-xs text-ink-light">{card.label}</p></div>)}
        </div>
        {notice && <div className="forest-note-card mb-8 text-sm text-ink">{notice}</div>}

        <section className="forest-panel forest-workspace-panel mb-8">
          <h2 className="font-bold text-ink mb-3">🧭 后台模块总览</h2>
          <div className="grid md:grid-cols-3 gap-3">
            {sections.map((section) => <div key={section.key} className="forest-info-card p-3"><p className="text-sm font-bold text-ink">{section.label}</p><p className="text-xs text-ink-light mt-1 leading-relaxed">{section.helper}</p></div>)}
          </div>
        </section>

        <ConsultationSettingsPanel config={consultationConfig} saving={saving} onSave={saveConsultationSetting} />

        <div className="grid lg:grid-cols-[360px_1fr] gap-6 mb-8">
          <div className="forest-panel">
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

          <div className="forest-panel max-h-[560px] overflow-auto">
            <h2 className="font-bold text-ink mb-3">👤 用户与权益数据库</h2>
            {loading ? <div className="text-center py-10 text-ink-light">加载中...</div> : users.map((user) => (
              <div key={user.id} className="forest-info-card p-3 mb-3">
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

function ConsultationSettingsPanel({ config, saving, onSave }: { config: { settings?: any[]; projects?: any[] }; saving: boolean; onSave: (payload: any) => void }) {
  const globalSetting = (config.settings || []).find((item) => item.scope === "GLOBAL");
  const [projectId, setProjectId] = useState("");
  const selectedSetting = (config.settings || []).find((item) => item.lookupKey === (projectId ? `PROJECT:${projectId}` : "GLOBAL")) || (!projectId ? globalSetting : null);
  const [qrImageUrl, setQrImageUrl] = useState(globalSetting?.qrImageUrl || "");
  const [contactName, setContactName] = useState(globalSetting?.contactName || "项目咨询老师");
  const [contactTitle, setContactTitle] = useState(globalSetting?.contactTitle || "数学小讲师联盟");
  const [description, setDescription] = useState(globalSetting?.description || "提交报名意向后，请扫码添加企业微信，老师会确认项目节奏、名额和适合度。");
  const [enabled, setEnabled] = useState(globalSetting?.enabled ?? true);
  const [uploading, setUploading] = useState(false);
  const [localNotice, setLocalNotice] = useState("");

  useEffect(() => {
    const current = selectedSetting || {};
    setQrImageUrl(current.qrImageUrl || "");
    setContactName(current.contactName || "项目咨询老师");
    setContactTitle(current.contactTitle || "数学小讲师联盟");
    setDescription(current.description || "提交报名意向后，请扫码添加企业微信，老师会确认项目节奏、名额和适合度。");
    setEnabled(current.enabled ?? true);
  }, [selectedSetting?.id, projectId]);

  const uploadQr = async (file?: File | null) => {
    if (!file) return;
    setUploading(true);
    setLocalNotice("");
    try {
      const form = new FormData();
      form.append("kind", "consultation-qr");
      form.append("file", file);
      const res = await fetch("/math-young-lecturer/api/uploads", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "二维码上传失败");
      setQrImageUrl(data.url || "");
      setLocalNotice("二维码已上传，请保存咨询入口配置。");
    } catch (error: any) {
      setLocalNotice(error.message || "二维码上传失败");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="forest-panel mb-8">
      <h2 className="font-bold text-ink mb-2">📱 企业微信/咨询入口配置</h2>
      <p className="text-xs text-ink-light mb-4 leading-relaxed">报名成功后展示真实二维码。可先配置全局入口；如某个项目需要不同老师，可选择项目保存项目级入口覆盖全局。</p>
      {localNotice && <div className="rounded-2xl bg-crayon-green/20 border border-ink/5 p-3 mb-4 text-xs text-ink">{localNotice}</div>}
      <div className="grid lg:grid-cols-[1fr_220px] gap-5">
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-xs text-ink-light md:col-span-2">配置范围
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink">
              <option value="">全局咨询入口</option>
              {(config.projects || []).map((project) => <option key={project.id} value={project.id}>项目级：{project.title}</option>)}
            </select>
          </label>
          <label className="text-xs text-ink-light">联系人名称
            <input value={contactName} onChange={(e) => setContactName(e.target.value)} maxLength={40} className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-light">联系人/项目标题
            <input value={contactTitle} onChange={(e) => setContactTitle(e.target.value)} maxLength={60} className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink" />
          </label>
          <label className="text-xs text-ink-light md:col-span-2">咨询说明
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} maxLength={240} className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink min-h-20" />
          </label>
          <label className="text-xs text-ink-light md:col-span-2">二维码图片
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadQr(e.target.files?.[0])} className="mt-1 w-full rounded-xl border border-ink/15 bg-paper px-3 py-2 text-sm text-ink" />
          </label>
          <label className="flex items-center gap-2 text-xs text-ink-light">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} /> 启用该入口
          </label>
          <button onClick={() => onSave({ projectId: projectId || null, qrImageUrl, contactName, contactTitle, description, enabled })} disabled={saving || uploading || !qrImageUrl} className="hand-btn hand-btn-green text-xs disabled:opacity-50">{saving ? "保存中..." : uploading ? "上传中..." : "保存咨询入口"}</button>
        </div>
        <div className="forest-info-card p-3 text-center">
          <p className="text-xs text-ink-light mb-2">当前二维码预览</p>
          {qrImageUrl ? <img src={qrImageUrl} alt="企业微信咨询二维码" className="mx-auto h-40 w-40 rounded-2xl object-cover bg-white border border-ink/10" /> : <div className="mx-auto h-40 w-40 rounded-2xl bg-white border border-dashed border-ink/20 grid place-items-center text-xs text-ink-light">请先上传二维码</div>}
          <p className="mt-3 text-sm font-bold text-ink">{contactName}</p>
          <p className="text-xs text-ink-light">{contactTitle}</p>
        </div>
      </div>
    </section>
  );
}

function DatabaseCard({ title, helper, children }: { title: string; helper: string; children: React.ReactNode }) {
  return <div className="forest-panel min-h-[280px]"><h2 className="font-bold text-ink mb-1">{title}</h2><p className="text-xs text-ink-light mb-4 leading-relaxed">{helper}</p><div className="space-y-3 max-h-80 overflow-auto">{children || <p className="text-sm text-ink-light">暂无数据</p>}</div></div>;
}

function RegistrationIntentRow({ intent, saving, onSave }: { intent: any; saving: boolean; onSave: (id: string, status: string, note: string, openProjectAccess?: boolean) => void }) {
  const [status, setStatus] = useState(intent.followUpStatus || "PENDING");
  const [note, setNote] = useState(intent.note || "");
  const [openProjectAccess, setOpenProjectAccess] = useState(false);
  const options = getRegistrationFollowUpOptions();
  const accessTodo = buildAccessTodoFromRegistration(intent);
  const canOpenAccess = status === "CONFIRMED" && accessTodo.needsAccessOpen;

  useEffect(() => {
    setStatus(intent.followUpStatus || "PENDING");
    setNote(intent.note || "");
    setOpenProjectAccess(false);
  }, [intent.id, intent.followUpStatus, intent.note]);

  return (
    <div className="forest-info-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-ink truncate">{intent.childName || intent.user?.name || "未命名孩子"} · {intent.project?.title || "未关联项目"}</p>
          <p className="text-xs text-ink-light mt-1">报名：{intent.status} · 跟进：{getFollowUpStatusLabel(intent.followUpStatus || "PENDING")} · {intent.grade || "—"}年级 · {intent.packageName || "项目报名意向"}</p>
        </div>
        <span className={`text-[11px] px-2 py-1 rounded-full border ${accessTodo.needsAccessOpen ? "bg-crayon-yellow/30 border-crayon-yellow text-ink" : "bg-white border-ink/10 text-ink-light"}`}>{accessTodo.label}</span>
      </div>
      <p className="text-xs text-ink-light mt-1 line-clamp-2">家长/账号：{intent.user?.name || "—"} · 联系方式：{intent.contact || intent.user?.phone || "未留"}</p>
      <p className="text-[11px] text-ink-light mt-2">下一步：{accessTodo.nextAction}</p>
      <div className="mt-3 grid gap-2">
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink">
          {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs text-ink min-h-16" placeholder="跟进备注：例如已加企业微信、约定沟通时间、暂缓原因。" />
        {canOpenAccess && (
          <label className="flex items-start gap-2 rounded-xl bg-white/80 border border-ink/10 p-3 text-xs text-ink-light">
            <input type="checkbox" checked={openProjectAccess} onChange={(e) => setOpenProjectAccess(e.target.checked)} className="mt-0.5" />
            <span><b className="text-ink">确认后同步开通项目权益</b><br />为这个学习者开通「{intent.project?.title || "对应项目"}」指定项目权限；如已开通则不重复创建。</span>
          </label>
        )}
        <button onClick={() => onSave(intent.id, status, note, canOpenAccess && openProjectAccess)} disabled={saving} className="hand-btn hand-btn-blue text-xs disabled:opacity-50">{saving ? "保存中..." : canOpenAccess && openProjectAccess ? "确认跟进并开通权益" : "保存跟进状态"}</button>
      </div>
    </div>
  );
}

function Row({ title, meta, note }: { title: string; meta: string; note?: string }) {
  return <div className="forest-info-card p-3"><p className="text-sm font-bold text-ink truncate">{title}</p><p className="text-xs text-ink-light mt-1">{meta}</p>{note && <p className="text-xs text-ink-light mt-1 line-clamp-2">{note}</p>}</div>;
}
