const FOLLOW_UP_LABELS = {
  PENDING: '待联系',
  CONTACTED: '已联系',
  CONFIRMED: '已确认名额/权益',
  CANCELLED: '已取消/暂缓',
};

const ALLOWED_FOLLOW_UP_STATUSES = new Set(Object.keys(FOLLOW_UP_LABELS));

export function normalizeRegistrationFollowUpUpdate(input = {}) {
  const followUpStatus = String(input.followUpStatus || '').trim().toUpperCase();
  if (!ALLOWED_FOLLOW_UP_STATUSES.has(followUpStatus)) {
    throw new Error('请选择有效的跟进状态');
  }
  const noteRaw = typeof input.note === 'string' ? input.note.trim() : '';
  const note = noteRaw ? noteRaw.slice(0, 200) : null;
  return { followUpStatus, note };
}

export function getRegistrationStatusAfterFollowUp(followUpStatus) {
  if (followUpStatus === 'CONFIRMED') return 'CONFIRMED';
  if (followUpStatus === 'CANCELLED') return 'CANCELLED';
  return 'PENDING';
}

export function getFollowUpStatusLabel(status) {
  return FOLLOW_UP_LABELS[status] || status;
}

export function getRegistrationFollowUpOptions() {
  return Object.entries(FOLLOW_UP_LABELS).map(([value, label]) => ({ value, label }));
}
