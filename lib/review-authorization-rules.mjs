export const WITHDRAWN_SHARE_SCOPE = "WITHDRAWN";
export const WITHDRAWN_REVIEW_STATUS = "WITHDRAWN";

export function canEnterOutcomeHall({ reviewStatus, shareScope } = {}) {
  return reviewStatus === "APPROVED" && shareScope === "PUBLIC_HALL";
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
