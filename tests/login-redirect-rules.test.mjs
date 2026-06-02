import test from 'node:test';
import assert from 'node:assert/strict';
import { getPostLoginRedirectPath } from '../lib/login-redirect-rules.mjs';

test('redirects teacher and admin to teacher workspace after login', () => {
  assert.equal(getPostLoginRedirectPath('TEACHER'), '/teacher');
  assert.equal(getPostLoginRedirectPath('ADMIN'), '/teacher');
});

test('redirects learner to growth passport after login', () => {
  assert.equal(getPostLoginRedirectPath('STUDENT'), '/profile');
});

test('falls back to homepage when role is missing or unknown', () => {
  assert.equal(getPostLoginRedirectPath(undefined), '/');
  assert.equal(getPostLoginRedirectPath('OTHER'), '/');
});
