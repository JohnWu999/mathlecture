export const WITHDRAWN_SHARE_SCOPE = "WITHDRAWN";
export const WITHDRAWN_REVIEW_STATUS = "WITHDRAWN";

const SUPPORTED_OUTCOME_SOURCE_TYPES = new Set(["ANSWER", "PROJECT_ARTIFACT"]);
const SUPPORTED_REVIEW_ACTIONS = new Set(["approve", "reject"]);
const SUPPORTED_SHARE_SCOPES = new Set(["QUESTION_AUTHOR_ONLY", "GROUP_ONLY", "PUBLIC_HALL"]);
const FORBIDDEN_PUBLIC_COPY_PATTERNS = [/排行榜/g, /排名/g, /超过/g, /第一/g, /TOP/gi, /积分门槛/g, /积分解锁/g];

function cleanText(value = "", maxLength = 240) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function canEnterOutcomeHall({ reviewStatus, shareScope } = {}) {
  return reviewStatus === "APPROVED" && shareScope === "PUBLIC_HALL";
}

export function normalizeOutcomeReviewInput({ sourceType, id, action, shareScope = "GROUP_ONLY", teacherNote = "" } = {}) {
  if (!id || !String(id).trim()) throw new Error("成果 ID 不能为空");
  if (!SUPPORTED_OUTCOME_SOURCE_TYPES.has(sourceType)) throw new Error("不支持的成果类型");
  if (!SUPPORTED_REVIEW_ACTIONS.has(action)) throw new Error("不支持的审核动作");
  if (!SUPPORTED_SHARE_SCOPES.has(shareScope)) throw new Error("不支持的公开范围");

  const reviewStatus = action === "approve" ? "APPROVED" : "REJECTED";
  const normalizedShareScope = action === "approve" ? shareScope : sourceType === "PROJECT_ARTIFACT" ? "GROUP_ONLY" : "QUESTION_AUTHOR_ONLY";

  return {
    sourceType,
    id: String(id).trim(),
    action,
    reviewStatus,
    shareScope: normalizedShareScope,
    teacherNote: cleanText(teacherNote, 500),
  };
}

export function buildWithdrawalUpdate({ reason = "公开授权已撤回" } = {}) {
  return {
    reviewStatus: "WITHDRAWN",
    shareScope: "WITHDRAWN",
    withdrawnAt: new Date(),
    withdrawalReason: cleanText(reason, 240) || "公开授权已撤回",
    deleteSourceRecord: false,
  };
}

export function buildShareAssetAuthorizationUpdate({ reviewStatus, shareScope, teacherNote = "", withdrawalReason = "" } = {}) {
  const base = {
    reviewStatus,
    shareScope,
    teacherNote: cleanText(teacherNote, 500) || undefined,
  };
  if (reviewStatus === "APPROVED" && shareScope === "PUBLIC_HALL") {
    return { ...base, authorizedAt: new Date(), withdrawnAt: null, withdrawalReason: null };
  }
  if (reviewStatus === "WITHDRAWN" || shareScope === "WITHDRAWN") {
    return {
      ...base,
      reviewStatus: "WITHDRAWN",
      shareScope: "WITHDRAWN",
      withdrawnAt: new Date(),
      withdrawalReason: cleanText(withdrawalReason, 240) || "公开授权已撤回",
    };
  }
  return base;
}

export function sanitizePublicOutcomeCopy(copy = "") {
  let sanitized = String(copy || "").trim();
  for (const pattern of FORBIDDEN_PUBLIC_COPY_PATTERNS) sanitized = sanitized.replace(pattern, "");
  sanitized = sanitized.replace(/\s+/g, " ").trim();
  if (!sanitized || sanitized.length < 12) return "这里看见孩子的真实表达，也守住公开边界；不比较、不排名。";
  if (!/不比较|真实表达|公开边界/.test(sanitized)) return `${sanitized}。这里看见真实表达，也守住公开边界，不比较。`;
  return sanitized;
}

export function canWithdrawPublicAuthorization({ actorRole, ownerId, actorId } = {}) {
  if (actorRole === "TEACHER" || actorRole === "ADMIN") return true;
  if (actorRole === "PARENT") return Boolean(ownerId && actorId && ownerId === actorId);
  return false;
}

export function extractArtifactUrl(content = "") {
  const match = String(content).match(/作品\/过程链接：([^\s]+)/);
  return match?.[1]?.trim() || "";
}

export function extractProjectArtifactTitle(content = "") {
  const lines = String(content)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^\[作品提交\]/.test(line))
    .filter((line) => !/^作品\/过程链接：/.test(line));
  const first = lines[0] || "一份项目作品";
  return first.length > 28 ? `${first.slice(0, 28)}…` : first;
}

export function buildProjectArtifactDraft({ messageId, groupId, projectId, authorId, content } = {}) {
  return {
    title: extractProjectArtifactTitle(content),
    description: String(content || "").trim(),
    artifactUrl: extractArtifactUrl(content),
    reviewStatus: "PENDING",
    shareScope: "GROUP_ONLY",
    sourceMessageId: messageId,
    groupId,
    projectId,
    authorId,
  };
}

export function isProjectSubmissionContent(content = "") {
  return /^\[作品提交\]/.test(String(content).trim());
}

export function getTeacherOutcomeReviewTabs() {
  return [
    { key: "pending-outcomes", label: "🌳 成果审核", helper: "讲解和项目作品先由老师确认，再决定能否公开。" },
    { key: "public-authorized", label: "🔐 授权管理", helper: "查看已公开成果，必要时可撤回公开授权。" },
    { key: "withdrawn", label: "↩️ 已撤回", helper: "保留孩子作品记录，但不在成果广场展示。" },
  ];
}

export function getAuthorizationStatusLabel({ reviewStatus, shareScope } = {}) {
  if (shareScope === "WITHDRAWN" || reviewStatus === "WITHDRAWN") return "公开授权已撤回 · 不在成果广场展示";
  if (reviewStatus === "PENDING" && shareScope === "PUBLIC_HALL") return "等待老师审核 · 已申请公开授权";
  if (reviewStatus === "APPROVED" && shareScope === "PUBLIC_HALL") return "老师审核通过 · 已授权公开";
  if (reviewStatus === "REJECTED") return "老师已退回 · 暂不公开";
  return "仅限相关同学查看";
}
