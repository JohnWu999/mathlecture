import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeRegistrationFollowUpUpdate,
  getRegistrationStatusAfterFollowUp,
  getFollowUpStatusLabel,
} from '../lib/registration-followup-rules.mjs';

test('registration follow-up accepts only explicit operating statuses', () => {
  assert.equal(normalizeRegistrationFollowUpUpdate({ followUpStatus: 'CONTACTED' }).followUpStatus, 'CONTACTED');
  assert.equal(normalizeRegistrationFollowUpUpdate({ followUpStatus: 'CONFIRMED' }).followUpStatus, 'CONFIRMED');
  assert.equal(normalizeRegistrationFollowUpUpdate({ followUpStatus: 'CANCELLED' }).followUpStatus, 'CANCELLED');
  assert.throws(() => normalizeRegistrationFollowUpUpdate({ followUpStatus: 'DONE' }), /跟进状态/);
});

test('registration follow-up note is trimmed and length-limited for admin operation logs', () => {
  const update = normalizeRegistrationFollowUpUpdate({
    followUpStatus: 'CONTACTED',
    note: `  已加企业微信，家长希望周五沟通  ${'x'.repeat(300)}`,
  });
  assert.equal(update.note.startsWith('已加企业微信'), true);
  assert.equal(update.note.length <= 200, true);
});

test('confirmed or cancelled follow-up synchronizes registration main status', () => {
  assert.equal(getRegistrationStatusAfterFollowUp('CONTACTED'), 'PENDING');
  assert.equal(getRegistrationStatusAfterFollowUp('CONFIRMED'), 'CONFIRMED');
  assert.equal(getRegistrationStatusAfterFollowUp('CANCELLED'), 'CANCELLED');
});

test('follow-up labels are operator-facing and not payment-first wording', () => {
  assert.equal(getFollowUpStatusLabel('PENDING'), '待联系');
  assert.equal(getFollowUpStatusLabel('CONTACTED'), '已联系');
  assert.equal(getFollowUpStatusLabel('CONFIRMED'), '已确认名额/权益');
  assert.equal(getFollowUpStatusLabel('CANCELLED'), '已取消/暂缓');
});
