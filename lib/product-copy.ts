export const SITE = {
  name: "数学小讲师联盟",
  slogan: "会思考，爱数学",
  audience: "小学1–3年级数学共学社区",
  heroTitle: "让一个好问题，长成一片数学森林",
  heroSubtitle: "孩子提问，孩子讲解，孩子一起把数学用起来。",
  primaryCta: "我要提问",
  secondaryCta: "看孩子如何成长",
} as const;

export const NAV_LINKS = [
  { href: "/qa", label: "你问我答" },
  { href: "/projects", label: "项目营" },
  { href: "/hall", label: "成果广场" },
  { href: "/profile", label: "个人中心" },
] as const;

export const PUBLIC_IDENTITIES = [
  {
    key: "questioner",
    label: "提问者",
    scene: "问题发芽",
    emoji: "❓",
    cta: "遇到难题？大胆问",
    detail: "拍照或语音上传你的困惑，给同伴留下一个可以一起思考的好问题。",
  },
  {
    key: "lecturer",
    label: "小讲师",
    scene: "讲解长高",
    emoji: "🎤",
    cta: "会讲题？慢慢讲清楚",
    detail: "认领一道题，在72小时内录制讲解；通过审核后，帮助同学看见另一种思路。",
  },
  {
    key: "explorer",
    label: "探索家",
    scene: "项目成林",
    emoji: "🌲",
    cta: "想深度玩？一起做项目",
    detail: "在项目里测量、观察、记录和汇报，把一个数学想法长成真实作品。",
  },
] as const;

export const GROWTH_ENERGY_COPY = {
  label: "数学成长能量",
  shortLabel: "成长能量",
  principle: "不公开排名，也不代表谁更聪明；只记录孩子在提问、讲解、探索和帮助同学中的真实努力。",
} as const;

export const WARM_MICROCOPY = {
  ask: "谢谢你把问题说出来",
  explain: "慢慢讲，我们听得见",
  project: "把想法带到真实世界里试试看",
} as const;


export const HOME_ACTIONS = {
  primary: { href: "/qa", label: "🙋 我要提问" },
  secondary: { href: "/qa", label: "🎤 去认领一道题" },
  account: { login: "已有账号？", loginLabel: "登录", register: "新同学？", registerLabel: "注册" },
  flowHints: ["先选身份", "家长放心", "加入吧！"],
  finalTitle: "准备好加入了吗？",
  finalSubtitle: "小学一、二年级种子用户招募中",
  finalCta: "立即报名",
} as const;

export const TRUST_ITEMS = [
  {
    colorKey: "questioner",
    icon: "🛡️",
    title: "内容安全",
    desc: "所有讲题视频经老师审核后才会展示",
  },
  {
    colorKey: "lecturer",
    icon: "📅",
    title: "时间灵活",
    desc: "异步协作，自己安排时间",
  },
  {
    colorKey: "explorer",
    icon: "🤝",
    title: "真实同伴",
    desc: "同年级孩子互助，不是 AI 陪聊",
  },
] as const;
