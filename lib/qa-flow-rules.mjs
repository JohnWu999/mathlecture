const ALLOWED_SHARE_SCOPES = new Set(["QUESTION_AUTHOR_ONLY", "PUBLIC_HALL", "GROUP_ONLY"]);

export const QUESTION_CONFUSION_TYPES = [
  "看不懂题意",
  "不知道先算什么",
  "画图不会画",
  "算式会错",
  "两种想法不确定",
  "其他",
];

function cleanText(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseGrade(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}

export function normalizeQuestionDraft(input = {}) {
  const title = cleanText(input.title) || cleanText(input.suggestedTitle);
  if (!title) {
    throw new Error("QUESTION_TITLE_REQUIRED");
  }

  const content = cleanText(input.content);
  if (!content) {
    throw new Error("QUESTION_CONTENT_REQUIRED");
  }

  const shareScope = ALLOWED_SHARE_SCOPES.has(input.shareScope)
    ? input.shareScope
    : "QUESTION_AUTHOR_ONLY";

  const confusionType = QUESTION_CONFUSION_TYPES.includes(input.confusionType)
    ? input.confusionType
    : cleanText(input.confusionType);

  return {
    title,
    suggestedTitle: cleanText(input.suggestedTitle) || title,
    content,
    recognizedText: cleanText(input.recognizedText),
    imageUrl: cleanText(input.imageUrl),
    isAnonymous: Boolean(input.isAnonymous),
    grade: parseGrade(input.grade),
    topic: cleanText(input.topic),
    confusionType,
    shareScope,
    reviewStatus: "PENDING",
    status: "OPEN",
    childMessage: "谢谢你把问题说出来。老师看过后，小讲师就可以来认领讲解。",
  };
}

export function getClaimWindow({ now = new Date(), lecturerId, hoursToExplain = 72 } = {}) {
  if (!lecturerId) {
    throw new Error("LECTURER_REQUIRED");
  }
  const claimedAt = new Date(now);
  const claimExpiresAt = new Date(claimedAt.getTime() + hoursToExplain * 60 * 60 * 1000);

  return {
    status: "CLAIMED",
    claimedById: lecturerId,
    claimedAt,
    claimExpiresAt,
    releasedAt: null,
    hoursToExplain,
    childMessage: `这道题已经被你认领啦。请在${hoursToExplain}小时内上传讲解；如果遇到困难，也可以请老师帮忙。`,
  };
}

export function createQuestionHeatDecision({ alreadyHeated } = {}) {
  if (alreadyHeated) {
    return {
      shouldCreate: false,
      heatIncrement: 0,
      visibility: "PRIVATE_LEDGER",
      rankingEnabled: false,
      sortingOnly: true,
      childMessage: "你已经帮这道题加过热度了。谢谢你告诉我们：这个问题也值得被讲清楚。",
    };
  }

  return {
    shouldCreate: true,
    heatIncrement: 1,
    visibility: "PRIVATE_LEDGER",
    rankingEnabled: false,
    sortingOnly: true,
    childMessage: "收到，你帮这道题加了一点热度。它会更容易被小讲师看见，但不会变成排名。",
  };
}

export function createQuestionApprovalGrowthEnergy({ questionId, userId } = {}) {
  if (!questionId) throw new Error("QUESTION_ID_REQUIRED");
  if (!userId) throw new Error("USER_ID_REQUIRED");

  return {
    userId,
    amount: 3,
    reason: "QUESTION_APPROVED",
    displayLabel: "提问成长能量",
    userMessage: "你提出一个认真问题，让大家有机会一起把它想清楚。",
    sourceType: "QUESTION",
    sourceId: questionId,
    visibility: "PRIVATE",
    affectsIdentityLevel: false,
    rankingEnabled: false,
  };
}
