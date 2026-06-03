export const PROJECT_ACCESS_PACKAGE_OPTIONS = [
  {
    value: 'BASIC_EXPERIENCE',
    label: '基础体验项目',
    helper: '开放免费/基础项目参与资格，适合刚进入平台的孩子。',
    quotaTotal: null,
    durationDays: null,
  },
  {
    value: 'FIVE_SESSION_PACK',
    label: '5次项目包',
    helper: '可用于 5 次项目服务或项目节点，由管理员登记消耗。',
    quotaTotal: 5,
    durationDays: null,
  },
  {
    value: 'TWENTY_WEEK_PACK',
    label: '20周项目包',
    helper: '按周期开放项目服务，默认 20 周有效。',
    quotaTotal: null,
    durationDays: 140,
  },
  {
    value: 'SPECIFIC_PROJECT',
    label: '指定项目权限',
    helper: '只开通某一个项目或专题营。',
    quotaTotal: 1,
    durationDays: null,
  },
  {
    value: 'PAUSE_PROJECT_ACCESS',
    label: '暂停项目权限',
    helper: '账号仍保留，但暂停新的项目参与资格。',
    quotaTotal: 0,
    durationDays: null,
  },
];

export function getWorkspaceForRole(role) {
  if (role === 'ADMIN') return { path: '/admin', label: '管理员后台' };
  if (role === 'TEACHER') return { path: '/teacher', label: '老师工作台' };
  if (role === 'STUDENT') return { path: '/profile', label: '成长护照' };
  return { path: '/', label: '首页' };
}

export function canManageCommercialProjectAccess(role) {
  return role === 'ADMIN';
}

export function getProjectAccessPackageOptions() {
  return PROJECT_ACCESS_PACKAGE_OPTIONS;
}

export function getProjectAccessDefaults(packageType, now = new Date()) {
  const option = PROJECT_ACCESS_PACKAGE_OPTIONS.find((item) => item.value === packageType);
  if (!option) return null;
  const validFrom = now;
  const validUntil = option.durationDays
    ? new Date(validFrom.getTime() + option.durationDays * 24 * 60 * 60 * 1000)
    : null;
  return {
    packageType: option.value,
    quotaTotal: option.quotaTotal,
    quotaUsed: 0,
    validFrom,
    validUntil,
    status: option.value === 'PAUSE_PROJECT_ACCESS' ? 'PAUSED' : 'ACTIVE',
  };
}

export function getTeacherStudentStatusCopy() {
  return {
    tabLabel: '👤 学生状态',
    dashboardButtonLabel: '👤 查看学生状态',
    helper: '这里仅查看学生基础参与状态；5次项目包、20周项目包、指定项目权限等商业/项目包权限，请到管理员后台开通并留痕。',
    activateLabel: '开放基础参与',
    deactivateLabel: '暂停基础参与',
    activeBadge: '基础参与已开放',
    inactiveBadge: '基础参与待开放',
  };
}
