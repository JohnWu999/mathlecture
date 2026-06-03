import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getRoleHomePath,
  getRequiredRoleForWorkspacePath,
  canAccessWorkspacePath,
  getPersonalCenterHrefForRole,
  getVisibleWorkspaceNavForRole,
  canAccessTeacherOperationApi,
  canAccessAdminOperationApi,
} from '../lib/role-access-boundary-rules.mjs';

test('each logged-in role has exactly one personal center destination', () => {
  assert.equal(getPersonalCenterHrefForRole('STUDENT'), '/profile');
  assert.equal(getPersonalCenterHrefForRole('TEACHER'), '/teacher');
  assert.equal(getPersonalCenterHrefForRole('ADMIN'), '/admin');
  assert.equal(getRoleHomePath('STUDENT'), '/profile');
  assert.equal(getRoleHomePath('TEACHER'), '/teacher');
  assert.equal(getRoleHomePath('ADMIN'), '/admin');
});

test('workspace pages require their matching role and cannot be used as identity switchers', () => {
  assert.equal(getRequiredRoleForWorkspacePath('/profile'), 'STUDENT');
  assert.equal(getRequiredRoleForWorkspacePath('/teacher'), 'TEACHER');
  assert.equal(getRequiredRoleForWorkspacePath('/admin'), 'ADMIN');

  assert.equal(canAccessWorkspacePath('TEACHER', '/profile'), false);
  assert.equal(canAccessWorkspacePath('TEACHER', '/teacher'), true);
  assert.equal(canAccessWorkspacePath('TEACHER', '/admin'), false);

  assert.equal(canAccessWorkspacePath('STUDENT', '/profile'), true);
  assert.equal(canAccessWorkspacePath('STUDENT', '/teacher'), false);
  assert.equal(canAccessWorkspacePath('STUDENT', '/admin'), false);

  assert.equal(canAccessWorkspacePath('ADMIN', '/profile'), false);
  assert.equal(canAccessWorkspacePath('ADMIN', '/teacher'), false);
  assert.equal(canAccessWorkspacePath('ADMIN', '/admin'), true);
});

test('navbar exposes only the current role workspace, not cross-role switch entries', () => {
  assert.deepEqual(getVisibleWorkspaceNavForRole('STUDENT'), [{ label: '个人中心', href: '/profile' }]);
  assert.deepEqual(getVisibleWorkspaceNavForRole('TEACHER'), [{ label: '老师工作台', href: '/teacher' }]);
  assert.deepEqual(getVisibleWorkspaceNavForRole('ADMIN'), [{ label: '管理员后台', href: '/admin' }]);
});

test('operation APIs are role separated: teacher APIs are not admin identity switching channels', () => {
  assert.equal(canAccessTeacherOperationApi('TEACHER'), true);
  assert.equal(canAccessTeacherOperationApi('ADMIN'), false);
  assert.equal(canAccessTeacherOperationApi('STUDENT'), false);
  assert.equal(canAccessAdminOperationApi('ADMIN'), true);
  assert.equal(canAccessAdminOperationApi('TEACHER'), false);
  assert.equal(canAccessAdminOperationApi('STUDENT'), false);
});
