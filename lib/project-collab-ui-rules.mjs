export const PROJECT_COLLAB_COPY = {
  title: "项目协作空间",
  subtitle: "跟着任务卡，把观察、讨论、作品和反馈一步步留下来。",
  safetyNote: "这里重视孩子自己的观察、计算、表达和倾听；工具可以帮助整理，但不能替孩子完成思考。",
  empty: "还没有协作记录。可以先说一句：我今天观察到了什么？",
};

export const PROJECT_MESSAGE_TYPES = [
  {
    type: "DISCUSSION",
    label: "讨论想法",
    emoji: "💬",
    helper: "说出你的想法、疑问或想听同伴补充的地方。",
  },
  {
    type: "EVIDENCE",
    label: "过程记录",
    emoji: "📎",
    helper: "上传观察、草图、测量照片或计算过程。",
  },
  {
    type: "SUBMISSION",
    label: "作品提交",
    emoji: "🌳",
    helper: "提交小组阶段作品，老师审核后才可能进入成果广场。",
  },
  {
    type: "REFLECTION",
    label: "项目反馈",
    emoji: "🪞",
    helper: "用三句话以内说说收获、感受、还想改进的地方。",
  },
];

const TASK_TEMPLATES = [
  { title: "观察任务", childAction: "今天先观察真实情境，把你看到的数学线索记下来。" },
  { title: "提出方案", childAction: "今天试着提出一种解决办法，并说清楚为什么这样想。" },
  { title: "计算与验证", childAction: "今天用画图、测量或计算来检查方案是否可靠。" },
  { title: "合作整理", childAction: "今天听一听伙伴的想法，把小组作品整理得更清楚。" },
  { title: "作品与反馈", childAction: "今天提交作品，并用自己的话说说这次探索的收获。" },
];

export function buildProjectTaskCards({ durationDays = 5, dayProgress = 1 } = {}) {
  const total = Math.max(1, Number(durationDays) || 1);
  const current = Math.min(Math.max(1, Number(dayProgress) || 1), total);
  return Array.from({ length: total }, (_, index) => {
    const day = index + 1;
    const template = TASK_TEMPLATES[Math.min(index, TASK_TEMPLATES.length - 1)];
    return {
      day,
      title: `Day ${day} · ${template.title}`,
      childAction: template.childAction,
      status: day < current ? "done" : day === current ? "active" : "locked",
      statusLabel: day < current ? "已完成" : day === current ? "今天重点" : "稍后开启",
    };
  });
}

export function getActiveTaskCard(cards = []) {
  return cards.find((card) => card.status === "active") || cards[0] || null;
}

export function getProjectMessageType(type = "DISCUSSION") {
  return PROJECT_MESSAGE_TYPES.find((item) => item.type === type) || PROJECT_MESSAGE_TYPES[0];
}

export function buildTypedMessageContent({ type = "DISCUSSION", text = "", artifactUrl = "" } = {}) {
  const meta = getProjectMessageType(type);
  const cleanText = String(text || "").trim();
  const cleanUrl = String(artifactUrl || "").trim();
  const parts = [`[${meta.label}]`, cleanText];
  if (cleanUrl) parts.push(`作品/过程链接：${cleanUrl}`);
  return parts.filter(Boolean).join("\n");
}

export function getProjectSubmissionPrompt() {
  return "作品提交后会先交给老师审核；审核通过并获得授权后，才可能进入成果广场。";
}

export function getProjectFeedbackPrompt() {
  return "项目反馈可以三句话以内：我发现了什么、我和伙伴怎么合作、我还想改进什么。";
}

export function getProjectCollabGrowthPrompt() {
  return "认真完成任务、留下过程记录、提交作品和反馈，都会成为你的探索成长能量记录；它只帮你看见自己的项目探索，不排名。";
}

export function getAiBoundaryCopy() {
  return "AI 可以帮助老师整理记录、发现遗漏，但不替孩子观察、计算、表达或完成作品。";
}
