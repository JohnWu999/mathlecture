export const OUTCOME_HALL_COPY = {
  title: "成果广场",
  eyebrow: "问题发芽 · 讲解长高 · 项目成林",
  subtitle: "这里展示老师审核通过、并获得孩子/家长授权公开的作品。",
  safetyNote: "成果广场是互相启发的森林，重视孩子真实的思考、表达和合作过程。",
};

export const SHARE_AUTHORIZATION_COPY = "只有老师审核通过，并经过孩子/家长授权公开的内容，才会出现在成果广场。";

export const OUTCOME_HALL_EMPTY_STATE = {
  state: "REVIEWING_FIRST_BATCH",
  title: "第一批试运营作品正在审核中",
  description: "成果广场只展示老师审核通过、并获得孩子/家长授权公开的真实作品；当前第一批作品仍在审核与授权确认中，我们不会展示未经授权的孩子作品。",
  primaryActionLabel: "回到你问我答，提出一个问题",
  primaryActionHref: "/math-young-lecturer/qa",
  secondaryNote: "等作品通过审核并完成公开授权后，这里会慢慢长出讲解成果和项目作品。",
};

export function getOutcomeHallEmptyState({ totalPublicOutcomes = 0 } = {}) {
  if (totalPublicOutcomes > 0) {
    return {
      ...OUTCOME_HALL_EMPTY_STATE,
      state: "FILTERED_EMPTY",
      title: "这个分类暂时还没有公开成果",
      description: "你可以切换到“全部”查看已通过老师审核、并完成孩子/家长授权公开的真实作品；未经授权的内容不会出现在成果广场。",
      primaryActionLabel: "查看全部成果",
      primaryActionHref: "#outcome-tabs",
    };
  }
  return OUTCOME_HALL_EMPTY_STATE;
}

export const OUTCOME_TYPES = [
  {
    type: "QUESTION",
    label: "问题发芽",
    emoji: "🌱",
    coverTone: "bg-crayon-green/35",
    description: "一个清楚的问题，让更多同学一起开始思考。",
  },
  {
    type: "LECTURE",
    label: "讲解长高",
    emoji: "🎤",
    coverTone: "bg-crayon-blue/30",
    description: "孩子用自己的方法，把一道题讲给别人听。",
  },
  {
    type: "PROJECT",
    label: "项目成林",
    emoji: "🌳",
    coverTone: "bg-crayon-yellow/35",
    description: "小组把观察、计算、合作和作品一起留下来。",
  },
];

export function getOutcomeTypeMeta(type = "LECTURE") {
  return OUTCOME_TYPES.find((item) => item.type === type) || OUTCOME_TYPES[1];
}

export function filterPublicOutcomes(outcomes = []) {
  return outcomes.filter((item) => item?.reviewStatus === "APPROVED" && item?.shareScope === "PUBLIC_HALL");
}

export function buildOutcomeCard(outcome = {}) {
  const meta = getOutcomeTypeMeta(outcome.type);
  const childName = outcome.childName || "小朋友";
  const grade = outcome.grade ? `${outcome.grade}年级` : "";
  const childExpression = outcome.childExpression || "孩子用自己的方式留下了思考过程。";
  const teacherNote = outcome.teacherNote || "老师看见了这份作品里的真实思考。";
  const authorized = outcome.reviewStatus === "APPROVED" && outcome.shareScope === "PUBLIC_HALL";

  return {
    id: outcome.id,
    type: meta.type,
    typeLabel: meta.label,
    emoji: meta.emoji,
    coverTone: meta.coverTone,
    title: outcome.title || "一份正在生长的数学作品",
    childMeta: [childName, grade].filter(Boolean).join(" · "),
    childLine: childExpression,
    teacherLine: `老师看见：${teacherNote}`,
    authorizationLabel: authorized ? "老师审核通过 · 已授权公开" : "仅限相关同学查看",
    href: outcome.href || (outcome.id ? `/hall/${outcome.id}` : ""),
    videoUrl: outcome.videoUrl || "",
  };
}

export function getOutcomeDetailSections({ type = "LECTURE" } = {}) {
  const meta = getOutcomeTypeMeta(type);
  return [
    {
      key: "child-thinking",
      title: "孩子怎么想",
      description: `保留${meta.label}里的儿童表达、画图、讲法或项目过程。`,
    },
    {
      key: "teacher-note",
      title: "老师温暖点评",
      description: "老师只点出值得被看见的思考、表达或合作，不把孩子改写成成人标准答案。",
    },
    {
      key: "sharing-boundary",
      title: "分享边界",
      description: SHARE_AUTHORIZATION_COPY,
    },
  ];
}

export function getOutcomeEmptyCopy(type = "LECTURE") {
  const meta = getOutcomeTypeMeta(type);
  if (meta.type === "PROJECT") return "第一批项目成果正在老师审核和家长授权确认中；没有完成公开授权的作品不会展示。";
  if (meta.type === "QUESTION") return "第一批好问题正在老师审核和公开授权确认中；未经授权的孩子内容不会展示。";
  return "第一批讲解成果正在老师审核和家长授权确认中；没有完成公开授权的讲解不会展示。";
}
