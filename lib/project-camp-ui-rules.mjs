export const PROJECT_CAMP_COPY = {
  title: "项目营",
  subtitle: "把数学放进真实任务里，和伙伴一起观察、设计、计算、表达。",
  intro: "项目不是闯关，也不是抢名额。它更像一片数学森林：孩子带着问题进入任务，在合作里慢慢看见数学的用处。",
  safetyNote: "项目卡只显示准备度、参与条件、组队状态和有效期；公开页面只呈现适合参与的信息。",
  empty: "新的项目还在准备中。一个好项目，需要真实任务、老师看护和适合孩子的节奏。",
};

const PROJECT_TYPE_COPY = {
  FREE: {
    label: "基础项目",
    helper: "免费开放，适合先体验项目学习的孩子。老师会做基础审核与安全看护。",
    badgeClass: "hand-badge-green",
  },
  PAID: {
    label: "主题项目包",
    helper: "包含老师指导、节点推进、作品反馈或证书等服务，适合希望完成完整主题探索的家庭。",
    badgeClass: "hand-badge-orange",
  },
};

export function normalizeProjectForPublicListing(project = {}) {
  const price = Number(project.price || 0);
  const hasPaidServicePrice = project.projectType === "PAID" && price > 0;
  if (hasPaidServicePrice) {
    return {
      ...project,
      price,
      projectType: "PAID",
      publicPricingState: "GUIDED_SERVICE",
      publicPricingNote: `这是含老师指导与人工跟进的主题服务，服务费用为 ¥${Math.round(price / 100)}。`,
    };
  }
  return {
    ...project,
    price: 0,
    projectType: "FREE",
    publicPricingState: "FREE_TRIAL",
    publicPricingNote: "第一批试运营按免费体验项目开放；付费闭环暂未开放，不在公开页面展示付费项目。",
  };
}

export function getProjectTypeLabel(projectType = "PAID", project = {}) {
  const normalizedType = Object.prototype.hasOwnProperty.call(project, "price")
    ? normalizeProjectForPublicListing({ projectType, price: project.price }).projectType
    : projectType;
  return PROJECT_TYPE_COPY[normalizedType] || PROJECT_TYPE_COPY.PAID;
}

export function getProjectPriceDisplay(project = {}) {
  const normalized = normalizeProjectForPublicListing(project);
  if (normalized.projectType === "FREE") {
    return {
      label: "免费体验",
      helper: normalized.publicPricingNote,
      tone: "free",
    };
  }
  return {
    label: `主题服务 ¥${Math.round(normalized.price / 100)}`,
    helper: normalized.publicPricingNote,
    tone: "paid",
  };
}

function sanitizeUnlockRule(unlockRule) {
  if (!unlockRule || !String(unlockRule).trim()) {
    return "适合愿意观察、动手、表达，并能在家长帮助下按时上传作品的孩子。";
  }
  return String(unlockRule)
    .replace(/\d+\s*(积分|成长能量|分)\s*(解锁|以上|起)/g, "完成相应准备后")
    .replace(/积分条件|积分解锁|分数条件/g, "准备条件")
    .trim();
}

export function getProjectReadiness(project = {}) {
  const tags = Array.isArray(project.knowledgeTags) && project.knowledgeTags.length > 0
    ? project.knowledgeTags.slice(0, 5)
    : ["观察", "表达", "合作"];
  return {
    title: "准备度 / 参与条件",
    summary: sanitizeUnlockRule(project.unlockRule),
    tags,
    helper: "这里说的是参与这个项目前最好具备的经验，不展示后台条件。",
  };
}

export function getProjectTeamStatus({ registrations = 0, groups = 0, groupSizeMin = 3, groupSizeMax = 5 } = {}) {
  if (groups > 0) {
    return {
      label: `已有小组 · ${groups}组在探索`,
      helper: `通常 ${groupSizeMin}-${groupSizeMax} 人一组，老师会根据报名顺序和项目节奏安排。`,
      tone: "active",
    };
  }
  if (registrations >= groupSizeMin) {
    return {
      label: "正在成组 · 等老师确认",
      helper: `报名人数已接近可成组范围，老师会确认时间与分组。`,
      tone: "forming",
    };
  }
  return {
    label: "正在成组 · 欢迎加入",
    helper: `通常 ${groupSizeMin}-${groupSizeMax} 人一组，先报名表达意向，老师再安排。`,
    tone: "open",
  };
}

export function formatProjectValidity(validUntil) {
  if (!validUntil) return "长期开放，老师会根据报名情况安排开始时间";
  const date = new Date(validUntil);
  if (Number.isNaN(date.getTime())) return "有效期以老师通知为准";
  return `有效期至 ${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function getProjectEnrollmentCopy(project = {}) {
  const pricing = getProjectPriceDisplay(project);
  if (pricing.tone === "free") {
    return {
      cta: "申请加入项目",
      priceLabel: pricing.label,
      helper: "提交后由老师确认是否适合本期节奏，再安排进入任务或小组。第一批试运营不在这里收取费用。",
    };
  }
  return {
    cta: "提交报名意向",
    priceLabel: pricing.label,
    helper: "先留下报名意向，老师或管理员人工确认服务内容、时间与名额；公开页面只记录意向，不直接处理付款。",
  };
}

export function getProjectGrowthPrompt() {
  return "完成项目任务、上传作品和认真反馈，都会成为你的探索成长能量记录；它只帮助你看见自己的探索过程，不排名。";
}
