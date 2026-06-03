import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  getLearnerPersonalCenterSections,
  getTeacherWorkspaceSections,
  getAdminDataWorkbenchSections,
} from '../lib/role-workspace-completeness-rules.mjs';

test('learner personal center contains full growth passport and own activity databases', () => {
  const sections = getLearnerPersonalCenterSections();
  assert.deepEqual(sections.map((section) => section.key), [
    'passportHeader',
    'growthEnergy',
    'identityTrees',
    'abilityBadges',
    'myQuestions',
    'myLectures',
    'myProjects',
    'myProjectAccess',
  ]);
  assert.match(sections.find((s) => s.key === 'growthEnergy')?.helper || '', /私密|不公开排名/);
});

test('teacher workspace remains learning-operation oriented and includes content review databases', () => {
  const sections = getTeacherWorkspaceSections();
  assert.deepEqual(sections.map((section) => section.key), [
    'dashboard',
    'questionReview',
    'lectureReview',
    'outcomeReview',
    'projectFollowUp',
    'studentStatus',
  ]);
  assert.equal(sections.some((s) => /付费|退费|项目包开通/.test(s.label + s.helper)), false);
});

test('admin workbench includes required asset databases from the design plan', () => {
  const sections = getAdminDataWorkbenchSections();
  assert.deepEqual(sections.map((section) => section.key), [
    'overview',
    'users',
    'projectAccess',
    'projectDatabase',
    'questionDatabase',
    'lectureVideoDatabase',
    'projectArtifactDatabase',
    'paymentRecords',
    'exportAuditLogs',
  ]);
  for (const key of ['projectDatabase', 'questionDatabase', 'lectureVideoDatabase']) {
    const section = sections.find((item) => item.key === key);
    assert.equal(section?.adminOnly, true);
  }
});

test('profile page does not call React hooks after early conditional returns', () => {
  const source = fs.readFileSync(new URL('../app/profile/page.tsx', import.meta.url), 'utf8');
  const firstReturn = source.indexOf('if (!session?.user)');
  const useMemoAfterFirstReturn = source.indexOf('useMemo(', firstReturn);
  assert.equal(useMemoAfterFirstReturn, -1, 'useMemo must be called before profile early returns to avoid login-time hook order crashes');
});
