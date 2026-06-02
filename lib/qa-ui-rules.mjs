export const QUESTION_FORM_STEPS = [
  {
    key: "photo",
    title: "先把题目放进来",
    helper: "可以拍照上传题目，也可以先贴一个题目图片链接；老师会先看安全和清晰度。",
  },
  {
    key: "suggested-title",
    title: "给问题起一个能看懂的名字",
    helper: "系统建议标题只是草稿，最后要由家长或孩子确认。",
  },
  {
    key: "confusion",
    title: "告诉我们卡在哪里",
    helper: "说清楚卡在哪里，不是为了判断谁会不会，而是帮助小讲师知道要从哪里讲起。"
  },
  {
    key: "sharing",
    title: "选择分享范围",
    helper: "默认只分享给相关同学；愿意公开时，也要等老师审核通过。",
  },
];

export const QUESTION_SHARE_OPTIONS = [
  {
    value: "QUESTION_AUTHOR_ONLY",
    label: "只分享给出题人和相关同学",
    childNote: "先让帮助你的人看见就好。",
    parentNote: "保护孩子提问安全感，不进入成果广场。",
  },
  {
    value: "PUBLIC_HALL",
    label: "愿意分享给更多同学带来启发",
    childNote: "如果这道题能帮到别人，可以选择公开。",
    parentNote: "仍需老师审核与家庭授权，审核通过后才会进入成果广场。",
  },
];

export const CONFUSION_OPTIONS = [
  "看不懂题意",
  "不知道先算什么",
  "画图不会画",
  "算式会错",
  "两种想法不确定",
  "其他",
];

export const GRADE_TOPIC_OPTIONS = {
  "1": ["20以内加减法", "100以内数的认识", "认识图形", "分类与比较", "认识钟表", "人民币初步", "找规律", "解决问题", "其他"],
  "2": ["100以内加减法", "表内乘法", "表内除法", "长度单位", "角的初步认识", "观察物体", "数据整理", "找规律", "解决问题", "其他"],
  "3": ["万以内数的认识", "两三位数乘一位数", "除法初步", "年月日", "周长", "面积初步", "分数初步", "小数初步", "统计与可能性", "解决问题", "其他"],
};

export function getQuestionStatusBadge({ status, reviewStatus } = {}) {
  if (reviewStatus === "PENDING") {
    return { label: "老师审核中", className: "bg-crayon-yellow/30", helper: "审核通过后才会出现在可认领列表。" };
  }
  if (reviewStatus === "REJECTED") {
    return { label: "待补充", className: "bg-crayon-pink/30", helper: "补充清楚后可以再请老师看。" };
  }
  if (status === "OPEN") {
    return { label: "可认领", className: "bg-crayon-green/30", helper: "小讲师可以选择认领讲解。" };
  }
  if (status === "CLAIMED") {
    return { label: "已认领", className: "bg-crayon-blue/30", helper: "小讲师正在准备讲解。" };
  }
  if (status === "ANSWERED") {
    return { label: "待审核讲解", className: "bg-crayon-yellow/30", helper: "老师看过后才会分享。" };
  }
  if (status === "RESOLVED") {
    return { label: "已讲清楚", className: "bg-crayon-green/30", helper: "这道题已经有被采纳的讲解。" };
  }
  return { label: "需要帮助", className: "bg-crayon-orange/30", helper: "老师会帮助继续推进。" };
}

export function getHeatPrompt({ heatCount = 0, hasHeated = false } = {}) {
  return {
    label: hasHeated ? `已加热度 · ${heatCount}` : `加一点热度 · ${heatCount}`,
    helper: "热度只帮助更多小讲师看见这个问题，不是排名，也不比较谁更厉害。",
    rankingEnabled: false,
    sortingOnly: true,
  };
}

export function formatClaimDeadline({ claimExpiresAt, now = new Date() } = {}) {
  if (!claimExpiresAt) {
    return { hoursLeft: null, label: "认领后72小时内上传讲解", helper: "慢慢讲，我们听得见。" };
  }
  const expiresAt = new Date(claimExpiresAt);
  const hoursLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000)));
  return {
    hoursLeft,
    label: hoursLeft > 0 ? `还剩约${hoursLeft}小时 · 72小时讲解窗口` : "认领已超过72小时",
    helper: hoursLeft > 0 ? "慢慢讲，我们听得见；如果遇到困难，可以请老师帮忙。" : "这道题可以重新开放给其他小讲师。",
  };
}

export function getAnswerSubmitPrompt(shareScope = "QUESTION_AUTHOR_ONLY") {
  if (shareScope === "PUBLIC_HALL") {
    return "讲解会先交给老师，老师审核通过后才可能进入成果广场。";
  }
  return "讲解会先交给老师审核，通过后分享给出题人和相关同学。";
}

export const TEACHER_QUESTION_REVIEW_COPY = {
  approveMessage: "通过后，孩子会收到一条私密的提问成长能量记录。",
  rejectMessage: "退回不是否定孩子，只是请孩子补充一点信息，让小讲师更容易帮忙。",
};
