import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildProjectArtifactDraft,
  buildShareAssetAuthorizationUpdate,
  buildWithdrawalUpdate,
  canEnterOutcomeHall,
  getAuthorizationStatusLabel,
  getTeacherOutcomeReviewTabs,
  isProjectSubmissionContent,
  normalizeOutcomeReviewInput,
  sanitizePublicOutcomeCopy,
} from '../lib/review-authorization-rules.mjs';

test('outcome hall requires both teacher approval and public authorization', () => {
  assert.equal(canEnterOutcomeHall({ reviewStatus: 'APPROVED', shareScope: 'PUBLIC_HALL' }), true);
  assert.equal(canEnterOutcomeHall({ reviewStatus: 'APPROVED', shareScope: 'GROUP_ONLY' }), false);
  assert.equal(canEnterOutcomeHall({ reviewStatus: 'PENDING', shareScope: 'PUBLIC_HALL' }), false);
  assert.equal(canEnterOutcomeHall({ reviewStatus: 'WITHDRAWN', shareScope: 'PUBLIC_HALL' }), false);
});

test('project submission content creates a pending group-only artifact draft', () => {
  const content = '[作品提交]\n我们用折纸证明了三角形内角和。\n作品/过程链接：/math-young-lecturer/uploads/project-artifact/2026-06/demo.pdf';
  assert.equal(isProjectSubmissionContent(content), true);

  const draft = buildProjectArtifactDraft({
    messageId: 'msg_1',
    groupId: 'group_1',
    projectId: 'project_1',
    authorId: 'user_1',
    content,
  });

  assert.equal(draft.reviewStatus, 'PENDING');
  assert.equal(draft.shareScope, 'GROUP_ONLY');
  assert.equal(draft.sourceMessageId, 'msg_1');
  assert.equal(draft.artifactUrl, '/math-young-lecturer/uploads/project-artifact/2026-06/demo.pdf');
  assert.match(draft.title, /折纸证明/);
});

test('outcome review input only allows supported source, action, share scope and trims teacher note', () => {
  const approved = normalizeOutcomeReviewInput({
    sourceType: 'PROJECT_ARTIFACT',
    id: 'artifact_1',
    action: 'approve',
    shareScope: 'PUBLIC_HALL',
    teacherNote: '  看见了真实的思考。  ',
  });
  assert.deepEqual(approved, {
    sourceType: 'PROJECT_ARTIFACT',
    id: 'artifact_1',
    action: 'approve',
    reviewStatus: 'APPROVED',
    shareScope: 'PUBLIC_HALL',
    teacherNote: '看见了真实的思考。',
  });

  assert.throws(() => normalizeOutcomeReviewInput({ sourceType: 'MESSAGE', id: 'x', action: 'approve' }), /不支持的成果类型/);
  assert.throws(() => normalizeOutcomeReviewInput({ sourceType: 'ANSWER', id: 'x', action: 'publish' }), /不支持的审核动作/);
  assert.throws(() => normalizeOutcomeReviewInput({ sourceType: 'ANSWER', id: 'x', action: 'approve', shareScope: 'PUBLIC' }), /不支持的公开范围/);
});

test('withdrawal update removes public display but keeps learning record metadata', () => {
  const update = buildWithdrawalUpdate({ reason: '  家长希望暂时不公开  ' });
  assert.equal(update.reviewStatus, 'WITHDRAWN');
  assert.equal(update.shareScope, 'WITHDRAWN');
  assert.equal(update.withdrawalReason, '家长希望暂时不公开');
  assert.ok(update.withdrawnAt instanceof Date);
  assert.equal(update.deleteSourceRecord, false);
});

test('share asset authorization mirrors approved public and withdrawn lifecycle', () => {
  const publicUpdate = buildShareAssetAuthorizationUpdate({ reviewStatus: 'APPROVED', shareScope: 'PUBLIC_HALL', teacherNote: '适合分享。' });
  assert.equal(publicUpdate.reviewStatus, 'APPROVED');
  assert.equal(publicUpdate.shareScope, 'PUBLIC_HALL');
  assert.equal(publicUpdate.teacherNote, '适合分享。');
  assert.ok(publicUpdate.authorizedAt instanceof Date);

  const withdrawnUpdate = buildShareAssetAuthorizationUpdate({ reviewStatus: 'WITHDRAWN', shareScope: 'WITHDRAWN', withdrawalReason: '撤回公开' });
  assert.equal(withdrawnUpdate.reviewStatus, 'WITHDRAWN');
  assert.equal(withdrawnUpdate.shareScope, 'WITHDRAWN');
  assert.equal(withdrawnUpdate.withdrawalReason, '撤回公开');
  assert.ok(withdrawnUpdate.withdrawnAt instanceof Date);
});

test('teacher workspace exposes outcome review authorization and withdrawn queues', () => {
  const tabs = getTeacherOutcomeReviewTabs();
  assert.deepEqual(tabs.map((tab) => tab.key), ['pending-outcomes', 'public-authorized', 'withdrawn']);
  assert.ok(tabs.some((tab) => tab.label.includes('成果审核')));
  assert.ok(tabs.some((tab) => tab.label.includes('授权管理')));
  assert.ok(tabs.some((tab) => tab.label.includes('已撤回')));
});

test('public labels explain boundaries without ranking or point-gate language', () => {
  assert.match(getAuthorizationStatusLabel({ reviewStatus: 'APPROVED', shareScope: 'PUBLIC_HALL' }), /审核通过|授权公开/);
  const copy = sanitizePublicOutcomeCopy('孩子超过了90%同学，积分门槛解锁，排行榜第一');
  assert.doesNotMatch(copy, /超过|排行榜|第一|积分门槛|积分解锁/);
  assert.match(copy, /不比较|真实表达|公开边界/);
});
