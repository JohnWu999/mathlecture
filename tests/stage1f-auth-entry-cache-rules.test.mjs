import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const middleware = fs.readFileSync(path.join(root, 'middleware.ts'), 'utf8');

// Regression for mobile Safari / WeChat browser after repeated deployments:
// login/profile HTML must not be served as year-long stale static shells that point to old chunks.
test('login and profile entry shells are covered by middleware for cache-control', () => {
  const matcherBlock = middleware.match(/matcher:\s*\[[\s\S]*?\]/)?.[0] ?? '';
  assert.match(matcherBlock, /"\/login"/, 'login shell must pass middleware so cache-control can be overridden');
  assert.match(matcherBlock, /"\/profile"/, 'profile shell must pass middleware so cache-control can be overridden without protecting the page shell');
});

test('auth-sensitive entry shells send no-store cache headers', () => {
  assert.match(middleware, /AUTH_ENTRY_SHELL_PATHS|NO_STORE_PAGE_PATHS/, 'middleware should centralize auth-sensitive entry shell paths');
  assert.match(middleware, /Cache-Control/i, 'middleware should set Cache-Control for auth-sensitive entry shells');
  assert.match(middleware, /no-store/i, 'login/profile shells should not be stored by mobile browsers or shared caches');
});
