const DEFAULT_PACKAGE = '项目报名意向';

export function normalizeProjectRegistrationIntent(input = {}) {
  const childName = String(input.childName || '').trim();
  if (!childName) throw new Error('请填写孩子昵称');

  const grade = Number(input.grade);
  if (!Number.isInteger(grade) || grade < 0 || grade > 3) {
    throw new Error('请选择大班或小学1–3年级');
  }

  const packageName = String(input.packageName || DEFAULT_PACKAGE).trim() || DEFAULT_PACKAGE;
  const contactRaw = input.contact == null ? '' : String(input.contact).trim();

  return {
    childName,
    grade,
    packageName,
    status: 'PENDING',
    contact: contactRaw || null,
    note: String(input.note || '').trim() || null,
    teacherWechatShown: true,
    followUpStatus: 'PENDING',
  };
}

export function getRegistrationInitialStatus() {
  return 'PENDING';
}

export function shouldShowTeacherWechatAfterIntent(intent) {
  return Boolean(intent?.teacherWechatShown);
}

export function buildLoginCallbackPath(path) {
  const clean = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
  return `/login?callbackUrl=${encodeURIComponent(clean)}`;
}

export const TEACHER_WECHAT_QR_PLACEHOLDER = '/math-young-lecturer/teacher-wechat-placeholder.svg';

export function getEnterpriseWechatPrompt() {
  return '报名意向已记录。请添加企业微信二维码或联系老师，管理员会在后台跟进状态；确认名额和项目权益后，再由管理员开通项目包。';
}
