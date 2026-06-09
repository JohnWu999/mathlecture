import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('question list does not expose answers whose status and reviewStatus disagree', () => {
  const source = read('app/api/questions/route.ts');
  assert.match(
    source,
    /answers:\s*\{[\s\S]*where:\s*\{[\s\S]*status:\s*"APPROVED"[\s\S]*reviewStatus:\s*"APPROVED"[\s\S]*\}[\s\S]*select:\s*\{/,
    'public question list must filter nested answers to status=APPROVED and reviewStatus=APPROVED before exposing answer state'
  );
});

test('question detail only shows answers that are both operationally approved and review-approved', () => {
  const source = read('app/api/questions/[id]/route.ts');
  assert.match(
    source,
    /where:\s*canReviewQuestions\(session\)[\s\S]*:\s*\{[\s\S]*status:\s*"APPROVED"[\s\S]*reviewStatus:\s*"APPROVED"[\s\S]*\}/,
    'non-staff question detail must require both Answer.status and Answer.reviewStatus to be APPROVED'
  );
});

test('question-owner answer acceptance cannot bypass teacher review and keeps statuses synchronized', () => {
  const source = read('app/api/answers/[id]/approve/route.ts');
  assert.match(source, /answer\.reviewStatus\s*!==\s*"APPROVED"/, 'owner acceptance must refuse answers that have not passed teacher review');
  assert.match(source, /老师审核通过后才能采纳|还在老师审核中/, 'owner acceptance should return a clear in-product review-state message');
  assert.match(
    source,
    /data:\s*\{[^}]*status:\s*"APPROVED"[^}]*reviewStatus:\s*"APPROVED"/s,
    'owner acceptance must keep Answer.status and Answer.reviewStatus synchronized when it writes approval state'
  );
});

test('teacher pending answer queue excludes state-conflicted historical answers', () => {
  const source = read('app/api/teacher/answers/route.ts');
  assert.match(
    source,
    /where:\s*\{[\s\S]*status:\s*"PENDING"[\s\S]*reviewStatus:\s*"PENDING"[\s\S]*videoUrl:\s*\{\s*not:\s*""\s*\}/,
    'teacher pending queue should require both status=PENDING and reviewStatus=PENDING so historical conflicts do not re-enter the queue'
  );
});

test('historical cleanup script is dry-run by default and treats reviewStatus as visibility source of truth', () => {
  const source = read('scripts/stage1f-clean-answer-status-conflicts.mjs');
  assert.match(source, /const APPLY = process\.argv\.includes\('--apply'\)/, 'cleanup script must require explicit --apply');
  assert.match(source, /reviewStatus === 'APPROVED'[\s\S]*return 'APPROVED'/, 'approved reviewStatus may restore approved business status');
  assert.match(source, /reviewStatus === 'REJECTED'[\s\S]*return 'REJECTED'/, 'rejected reviewStatus must not remain approved');
  assert.match(source, /return 'PENDING'/, 'pending reviewStatus must downgrade conflicted business status to pending');
  assert.match(source, /remainingConflictCount/, 'cleanup script must verify remaining conflicts after apply');
});
