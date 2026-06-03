import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostLoginRedirectPath } from '../lib/login-redirect-rules.mjs';
import {
  getWorkspaceForRole,
  canManageCommercialProjectAccess,
  getProjectAccessPackageOptions,
  getTeacherStudentStatusCopy,
} from '../lib/admin-teacher-workspace-rules.mjs';

test('routes teacher and admin to distinct workspaces after login', () => {
  assert.equal(getPostLoginRedirectPath('TEACHER'), '/teacher');
  assert.equal(getPostLoginRedirectPath('ADMIN'), '/admin');
  assert.equal(getWorkspaceForRole('TEACHER').path, '/teacher');
  assert.equal(getWorkspaceForRole('ADMIN').path, '/admin');
  assert.equal(getWorkspaceForRole('STUDENT').path, '/profile');
});

test('commercial project access is admin-only while teachers keep learning review scope', () => {
  assert.equal(canManageCommercialProjectAccess('ADMIN'), true);
  assert.equal(canManageCommercialProjectAccess('TEACHER'), false);
  assert.equal(canManageCommercialProjectAccess('STUDENT'), false);
});

test('admin project access dropdown includes free, 5-session, 20-week, and specific project options', () => {
  const options = getProjectAccessPackageOptions();
  assert.deepEqual(options.map((o) => o.value), [
    'BASIC_EXPERIENCE',
    'FIVE_SESSION_PACK',
    'TWENTY_WEEK_PACK',
    'SPECIFIC_PROJECT',
    'PAUSE_PROJECT_ACCESS',
  ]);
  assert.match(options.find((o) => o.value === 'FIVE_SESSION_PACK')?.label || '', /5次/);
  assert.match(options.find((o) => o.value === 'TWENTY_WEEK_PACK')?.label || '', /20周/);
});

test('teacher workspace copy frames users as student status, not admin permission management', () => {
  const copy = getTeacherStudentStatusCopy();
  assert.equal(copy.tabLabel, '👤 学生状态');
  assert.match(copy.helper, /项目包|管理员后台/);
  assert.equal(copy.activateLabel, '开放基础参与');
  assert.equal(copy.deactivateLabel, '暂停基础参与');
});
