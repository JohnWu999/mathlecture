import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getUploadPolicy,
  isAcceptedUploadMime,
  buildUploadPublicUrl,
  sanitizeUploadFilename,
} from '../lib/upload-rules.mjs';
import {
  normalizeProjectRegistrationIntent,
  getRegistrationInitialStatus,
  shouldShowTeacherWechatAfterIntent,
  buildLoginCallbackPath,
} from '../lib/p0-closure-rules.mjs';

test('image uploads accept real image files and reject url-only fake uploads', () => {
  const policy = getUploadPolicy('question-image');
  assert.equal(policy.inputMode, 'file');
  assert.equal(policy.copy.includes('链接'), false);
  assert.equal(isAcceptedUploadMime('question-image', 'image/jpeg'), true);
  assert.equal(isAcceptedUploadMime('question-image', 'image/png'), true);
  assert.equal(isAcceptedUploadMime('question-image', 'video/mp4'), false);
});

test('video uploads accept video files with a larger size limit', () => {
  const policy = getUploadPolicy('answer-video');
  assert.equal(policy.inputMode, 'file');
  assert.ok(policy.maxBytes > getUploadPolicy('question-image').maxBytes);
  assert.equal(isAcceptedUploadMime('answer-video', 'video/mp4'), true);
  assert.equal(isAcceptedUploadMime('answer-video', 'image/png'), false);
});

test('uploaded files get safe names and public urls under uploads', () => {
  assert.equal(sanitizeUploadFilename(' 一道题?.PNG '), 'yi-dao-ti.png');
  assert.equal(sanitizeUploadFilename('math video.mp4'), 'math-video.mp4');
  assert.match(buildUploadPublicUrl({ kind: 'question-image', storedName: 'abc.png' }), /^\/math-young-lecturer\/uploads\/question-image\/abc\.png$/);
});

test('project registration creates a pending intent with optional contact and qr tracking', () => {
  const intent = normalizeProjectRegistrationIntent({
    childName: '小树',
    grade: '2',
    packageName: '5次项目包',
    contact: 'wechat: parent',
  });
  assert.equal(intent.childName, '小树');
  assert.equal(intent.grade, 2);
  assert.equal(intent.packageName, '5次项目包');
  assert.equal(intent.contact, 'wechat: parent');
  assert.equal(getRegistrationInitialStatus(), 'PENDING');
  assert.equal(shouldShowTeacherWechatAfterIntent(intent), true);
});

test('project registration intent keeps contact optional but requires child and grade', () => {
  const intent = normalizeProjectRegistrationIntent({ childName: '小芽', grade: 1, packageName: '免费体验项目' });
  assert.equal(intent.contact, null);
  assert.throws(() => normalizeProjectRegistrationIntent({ grade: 1 }), /孩子昵称/);
  assert.throws(() => normalizeProjectRegistrationIntent({ childName: '小芽', grade: 5 }), /年级/);
});

test('protected actions route guests to login with callback path', () => {
  assert.equal(buildLoginCallbackPath('/qa/ask'), '/login?callbackUrl=%2Fqa%2Fask');
  assert.equal(buildLoginCallbackPath('/projects/p1'), '/login?callbackUrl=%2Fprojects%2Fp1');
});
