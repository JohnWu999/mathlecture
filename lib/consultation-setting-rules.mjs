const UPLOAD_QR_PREFIX = '/math-young-lecturer/uploads/consultation-qr/';

export function normalizeConsultationSettingInput(input = {}) {
  const qrImageUrl = String(input.qrImageUrl || '').trim();
  if (!qrImageUrl.startsWith(UPLOAD_QR_PREFIX)) {
    throw new Error('请先上传真实企业微信二维码图片');
  }
  const contactName = String(input.contactName || '项目咨询老师').trim().slice(0, 40) || '项目咨询老师';
  const contactTitle = String(input.contactTitle || '数学小讲师联盟').trim().slice(0, 60) || '数学小讲师联盟';
  const description = String(input.description || '提交报名意向后，请扫码添加企业微信，老师会确认项目节奏、名额和适合度。').trim().slice(0, 240);
  const projectId = input.projectId ? String(input.projectId).trim() : null;
  const scope = projectId ? 'PROJECT' : 'GLOBAL';
  return {
    scope,
    projectId,
    qrImageUrl,
    contactName,
    contactTitle,
    description,
    enabled: input.enabled === undefined ? true : Boolean(input.enabled),
  };
}

export function chooseEffectiveConsultationSetting({ projectSetting, globalSetting }) {
  if (projectSetting?.enabled && projectSetting.qrImageUrl) return projectSetting;
  if (globalSetting?.enabled && globalSetting.qrImageUrl) return globalSetting;
  return null;
}

export function buildConsultationDisplay(setting) {
  if (!setting?.qrImageUrl) return null;
  const contactName = setting.contactName || '项目咨询老师';
  const description = setting.description || '提交报名意向后，请扫码添加企业微信，老师会确认项目节奏、名额和适合度。';
  return {
    title: `添加${contactName}`,
    contactName,
    contactTitle: setting.contactTitle || '数学小讲师联盟',
    qrImageUrl: setting.qrImageUrl,
    description,
    helper: '这是报名意向后的人工咨询入口，不是自动付款或自动确认名额。',
  };
}
