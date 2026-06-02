export const GROWTH_ENERGY_REASONS = Object.freeze({
  QUESTION_APPROVED: "QUESTION_APPROVED",
  QUESTION_CONFUSION_COMPLETED: "QUESTION_CONFUSION_COMPLETED",
  ANSWER_APPROVED: "ANSWER_APPROVED",
  HELP_CLASSMATE: "HELP_CLASSMATE",
  PROJECT_TASK_COMPLETED: "PROJECT_TASK_COMPLETED",
  PROJECT_OUTCOME_APPROVED: "PROJECT_OUTCOME_APPROVED",
  REFLECTION_SUBMITTED: "REFLECTION_SUBMITTED",
});

export const GROWTH_ENERGY_VISIBILITY = Object.freeze({
  PRIVATE: "PRIVATE",
});

const RULES = Object.freeze({
  [GROWTH_ENERGY_REASONS.QUESTION_APPROVED]: {
    amount: 5,
    displayLabel: "提问成长能量",
    userMessage: "谢谢你把问题说出来。一个真实的问题，就是数学森林里新发芽的一颗种子。",
  },
  [GROWTH_ENERGY_REASONS.QUESTION_CONFUSION_COMPLETED]: {
    amount: 2,
    displayLabel: "表达困惑成长能量",
    userMessage: "你把卡住的地方说清楚了，这会帮助小讲师更懂你真正需要什么。",
  },
  [GROWTH_ENERGY_REASONS.ANSWER_APPROVED]: {
    amount: 10,
    displayLabel: "讲解成长能量",
    userMessage: "你努力把一道题讲清楚了。讲给别人听，也是让自己的思考长高。",
  },
  [GROWTH_ENERGY_REASONS.HELP_CLASSMATE]: {
    amount: 3,
    displayLabel: "帮助同学成长能量",
    userMessage: "你给同学留下了有帮助的提醒。数学可以一个人想，也可以一起想。",
  },
  [GROWTH_ENERGY_REASONS.PROJECT_TASK_COMPLETED]: {
    amount: 8,
    displayLabel: "项目探索成长能量",
    userMessage: "你完成了一个项目任务。把数学放进真实问题里，它就更有生命了。",
  },
  [GROWTH_ENERGY_REASONS.PROJECT_OUTCOME_APPROVED]: {
    amount: 12,
    displayLabel: "项目成果成长能量",
    userMessage: "你的项目成果通过了审核。它记录的是一次认真探索，不是和别人比较。",
  },
  [GROWTH_ENERGY_REASONS.REFLECTION_SUBMITTED]: {
    amount: 3,
    displayLabel: "复盘成长能量",
    userMessage: "你愿意回头看看自己的想法，这也是很重要的数学能力。",
  },
});

export function calculateGrowthEnergyTransaction(input) {
  const rule = RULES[input?.reason];

  if (!rule) {
    throw new Error(`Unknown growth energy reason: ${input?.reason ?? ""}`);
  }

  return {
    amount: rule.amount,
    reason: input.reason,
    displayLabel: rule.displayLabel,
    userMessage: rule.userMessage,
    sourceType: input.sourceType ?? null,
    sourceId: input.sourceId ?? null,
    visibility: GROWTH_ENERGY_VISIBILITY.PRIVATE,
    affectsIdentityLevel: false,
  };
}

export function getGrowthEnergySummary(transactions) {
  const safeTransactions = Array.isArray(transactions) ? transactions : [];
  const total = safeTransactions.reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const sourceLabels = [...new Set(safeTransactions.map((transaction) => {
    const rule = RULES[transaction.reason];
    return rule?.displayLabel;
  }).filter(Boolean))];

  return {
    total,
    sourceLabels,
    rankingEnabled: false,
    childExplanation: "数学成长能量记录你提问、讲解、帮助同学和参加项目的过程，不代表谁更聪明。",
    parentExplanation: "成长能量用于帮助孩子看见自己的参与、表达、讲解、合作和项目探索，不用于公开排名，也不直接等同能力高低。",
  };
}

export function listGrowthEnergyRules() {
  return Object.entries(RULES).map(([reason, rule]) => ({
    reason,
    ...rule,
    visibility: GROWTH_ENERGY_VISIBILITY.PRIVATE,
    affectsIdentityLevel: false,
  }));
}
