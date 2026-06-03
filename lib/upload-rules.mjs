const UPLOAD_POLICIES = {
  'question-image': {
    inputMode: 'file',
    maxBytes: 8 * 1024 * 1024,
    accept: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    copy: '上传题目照片，老师审核后才会进入题库。',
  },
  'answer-video': {
    inputMode: 'file',
    maxBytes: 250 * 1024 * 1024,
    accept: ['video/mp4', 'video/webm', 'video/quicktime'],
    copy: '上传讲题视频，老师审核后才会分享。',
  },
  'project-artifact': {
    inputMode: 'file',
    maxBytes: 250 * 1024 * 1024,
    accept: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp4', 'audio/webm', 'audio/wav', 'application/pdf'],
    copy: '上传项目过程或作品，审核授权后才会公开。',
  },
};

const PINYIN_HINTS = new Map([
  ['一', 'yi'], ['道', 'dao'], ['题', 'ti'], ['数', 'shu'], ['学', 'xue'], ['讲', 'jiang'], ['解', 'jie'],
]);

export function getUploadPolicy(kind) {
  const policy = UPLOAD_POLICIES[kind];
  if (!policy) throw new Error(`未知上传类型：${kind}`);
  return { kind, ...policy };
}

export function isAcceptedUploadMime(kind, mime) {
  return getUploadPolicy(kind).accept.includes(String(mime || '').toLowerCase());
}

export function sanitizeUploadFilename(filename) {
  const raw = String(filename || 'upload').trim().toLowerCase();
  const dot = raw.lastIndexOf('.');
  const ext = dot >= 0 ? raw.slice(dot).replace(/[^.a-z0-9]/g, '') : '';
  const base = (dot >= 0 ? raw.slice(0, dot) : raw)
    .split('')
    .map((ch) => PINYIN_HINTS.has(ch) ? `-${PINYIN_HINTS.get(ch)}-` : ch)
    .join('')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80) || 'upload';
  return `${base}${ext || ''}`;
}

export function buildUploadPublicUrl({ kind, storedName }) {
  getUploadPolicy(kind);
  return `/math-young-lecturer/uploads/${kind}/${storedName}`;
}

export function assertUploadAllowed({ kind, mime, size }) {
  const policy = getUploadPolicy(kind);
  if (!isAcceptedUploadMime(kind, mime)) {
    throw new Error(`不支持的文件类型：${mime || '未知'}`);
  }
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('文件不能为空');
  }
  if (size > policy.maxBytes) {
    throw new Error(`文件过大，请控制在 ${Math.round(policy.maxBytes / 1024 / 1024)}MB 以内`);
  }
  return true;
}
