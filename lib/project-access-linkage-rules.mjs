const VALID_PACKAGE_TYPES = new Set([
  'BASIC_EXPERIENCE',
  'FIVE_SESSION_PACK',
  'TWENTY_WEEK_PACK',
  'SPECIFIC_PROJECT',
  'PAUSE_PROJECT_ACCESS',
]);

function clean(value = '', max = 240) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, max);
}

export function getAccessStatusAfterRegistrationFollowUp(followUpStatus) {
  return followUpStatus === 'CONFIRMED' ? 'READY_TO_OPEN_ACCESS' : 'NOT_READY';
}

export function shouldOpenAccessForRegistration(registration = {}) {
  return registration.status === 'CONFIRMED' && registration.followUpStatus === 'CONFIRMED';
}

export function normalizeAccessOpenRequest({ userId, projectId = null, packageType = 'SPECIFIC_PROJECT', note = '' } = {}) {
  const normalizedUserId = clean(userId);
  const normalizedProjectId = projectId ? clean(projectId) : null;
  if (!normalizedUserId) throw new Error('缺少学习者');
  if (!VALID_PACKAGE_TYPES.has(packageType)) throw new Error('未知项目权益类型');
  if (packageType === 'SPECIFIC_PROJECT' && !normalizedProjectId) throw new Error('指定项目权益必须选择项目');
  return {
    userId: normalizedUserId,
    projectId: normalizedProjectId,
    packageType,
    note: clean(note, 500),
  };
}

export function buildConfirmedRegistrationAccessInput(registration = {}, { operatorId } = {}) {
  if (!shouldOpenAccessForRegistration(registration)) throw new Error('报名尚未确认，不能开通项目权益');
  const userId = registration.user?.id || registration.userId;
  const projectId = registration.project?.id || registration.projectId;
  const projectTitle = registration.project?.title || '对应项目';
  const learnerName = registration.user?.name || '学习者';
  const request = normalizeAccessOpenRequest({
    userId,
    projectId,
    packageType: 'SPECIFIC_PROJECT',
    note: `报名已确认，为${learnerName}开通「${projectTitle}」项目权益。`,
  });
  if (!operatorId) throw new Error('缺少管理员操作人');
  return {
    ...request,
    openedById: operatorId,
    status: 'ACTIVE',
    quotaTotal: 1,
    quotaUsed: 0,
    validFrom: new Date(),
    validUntil: null,
    registrationId: registration.id,
  };
}

export function buildAccessTodoFromRegistration(registration = {}) {
  const projectId = registration.project?.id || registration.projectId;
  const hasActiveAccess = Array.isArray(registration.projectAccesses)
    && registration.projectAccesses.some((access) => access.status === 'ACTIVE' && (!projectId || access.projectId === projectId));

  if (!shouldOpenAccessForRegistration(registration)) {
    return {
      registrationId: registration.id,
      needsAccessOpen: false,
      label: '报名仍在人工跟进中',
      nextAction: '确认适合后再开通项目权益',
    };
  }

  if (hasActiveAccess) {
    return {
      registrationId: registration.id,
      needsAccessOpen: false,
      label: '报名已确认，权益已开通',
      nextAction: '学习者可在个人中心查看并进入项目',
    };
  }

  return {
    registrationId: registration.id,
    needsAccessOpen: true,
    label: '报名已确认，待开通项目权益',
    nextAction: '为学习者开通项目权益，让孩子可以进入项目空间',
  };
}

export function getLearnerProjectAccessCopy({ packageType, status, projectTitle = '项目营' } = {}) {
  const active = status === 'ACTIVE';
  const packageLabel = packageType === 'FIVE_SESSION_PACK'
    ? '5 次项目包'
    : packageType === 'TWENTY_WEEK_PACK'
      ? '20 周项目包'
      : packageType === 'BASIC_EXPERIENCE'
        ? '基础体验'
        : packageType === 'PAUSE_PROJECT_ACCESS'
          ? '项目暂停记录'
          : projectTitle;
  return {
    title: packageType === 'SPECIFIC_PROJECT' ? `「${projectTitle}」项目权益` : packageLabel,
    statusLabel: active ? '已开通' : status === 'PAUSED' ? '已暂停' : status === 'EXPIRED' ? '已到期' : '已取消',
    helper: active ? '可以进入项目，留下探索过程和作品记录。' : '这条权益记录保留在个人中心，具体安排可联系老师或管理员。',
    readonly: true,
  };
}

export function buildAccessOpenAuditPayload({ registrationId, accessId, userId, projectId, packageType } = {}) {
  return {
    registrationId,
    accessId,
    userId,
    projectId,
    packageType,
  };
}
