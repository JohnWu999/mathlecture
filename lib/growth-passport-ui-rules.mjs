export const GROWTH_ENERGY_SOURCES = [
  "提问：提出一个清楚的问题，把困惑说出来，帮助更多同学一起思考。",
  "完成一次讲解：尝试把方法讲给别人听。",
  "讲解通过老师审核：数学正确、安全、基本清楚。",
  "参加项目并完成任务：在真实任务里使用数学。",
  "提交项目成果或反馈：把过程、发现和倾听留下来。",
];

export const GROWTH_ENERGY_USES = [
  "记录个人成长：看见自己在提问、讲解、合作和探索上的真实参与。",
  "辅助项目准备度：帮助老师判断孩子是否适合尝试某些项目。",
  "辅助身份成长：作为提问者、小讲师、探索家星级判断的参考之一。",
  "生成成长回忆：未来可以变成专属成长海报或成长护照记录。",
];

export const IDENTITY_PASSPORTS = [
  {
    type: "QUESTIONER",
    label: "提问者",
    icon: "🌱",
    colorClass: "bg-crayon-green/25",
    description: "愿意把真实困惑说出来，让一个问题开始发芽。",
    firstStep: "提出一个真实问题，并通过老师审核。",
    nextStepVerb: "继续提出清楚的问题",
  },
  {
    type: "LECTURER",
    label: "小讲师",
    icon: "🎤",
    colorClass: "bg-crayon-yellow/30",
    description: "试着把自己的方法讲给别人听，让讲解慢慢长高。",
    firstStep: "完成一次讲解，并通过老师审核。",
    nextStepVerb: "继续讲清楚一道题",
  },
  {
    type: "EXPLORER",
    label: "探索家",
    icon: "🌳",
    colorClass: "bg-crayon-blue/25",
    description: "在项目里使用数学，和同伴一起把想法做出来。",
    firstStep: "参加一个项目，并完成关键任务。",
    nextStepVerb: "继续完成一个项目任务",
  },
];

function clampLevel(level = 0) {
  return Math.max(0, Math.min(3, Number(level) || 0));
}

function starsFor(level = 0) {
  const safeLevel = clampLevel(level);
  return "★".repeat(safeLevel) + "☆".repeat(3 - safeLevel);
}

export function getGrowthEnergyCopy(total = 0) {
  return {
    title: "我的数学成长能量",
    current: `你现在有 ${Number(total) || 0} 点成长能量。`,
    subtitle: "这些能量来自你的提问、讲解、项目探索和认真反馈。",
    childExplanation: "成长能量不是比赛，也不代表谁更聪明；它只是帮你看见自己做过的努力。",
    parentExplanation: "成长能量记录孩子的学习参与、表达、讲解、合作和项目探索，不用于公开排名，也不直接等同能力高低。",
    rankingEnabled: false,
    showPublicPointTotal: false,
  };
}

export function getIdentityPassportCard(progress = {}) {
  const base = IDENTITY_PASSPORTS.find((item) => item.type === progress.identityType) || IDENTITY_PASSPORTS[0];
  const level = clampLevel(progress.level);
  const effectiveCount = Number(progress.effectiveCount) || 0;
  const qualityCount = Number(progress.qualityCount) || 0;

  return {
    ...base,
    level,
    stars: starsFor(level),
    effectiveCount,
    qualityCount,
    publicRanking: false,
    statusText: level > 0 ? `${base.label}已点亮 ${level} 星` : `${base.label}还在发芽`,
    nextStep: level > 0 ? `${base.nextStepVerb}，让这棵小树再长高一点。` : base.firstStep,
  };
}

export function formatGrowthEnergyTransaction(tx = {}) {
  const amount = Number(tx.amount) || 0;
  const createdAt = tx.createdAt ? new Date(tx.createdAt) : null;
  const dateLabel = createdAt && !Number.isNaN(createdAt.getTime())
    ? createdAt.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" })
    : "刚刚";

  return {
    title: tx.displayLabel || tx.reason || "成长能量记录",
    amountLabel: `${amount >= 0 ? "+" : ""}${amount} 能量`,
    message: tx.userMessage || "你留下了一次真实的数学成长记录。",
    dateLabel,
    identityNote: tx.affectsIdentityLevel ? "这条记录也会进入身份成长参考。" : "这条记录会被看见，但不会直接兑换身份星级。",
  };
}

export function getPassportSafetyCopy() {
  return {
    child: "这里不是比赛，也不是谁更厉害的表。它只是你自己的数学成长护照。",
    parent: "成长能量不用于公开排名，也不代表谁更聪明；它帮助家庭和老师看见孩子真实的提问、表达、讲解、合作和项目探索。",
    teacher: "老师可把它作为观察孩子参与和准备度的辅助线索，但不能只用数字判断能力。",
    showPublicPointTotal: false,
  };
}
