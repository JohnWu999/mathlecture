import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const loginPage = fs.readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');

// Regression: on mobile browsers, credentials sign-in can set the cookie before
// next-auth/react getSession() immediately reflects the user. A successful login
// must wait/retry for session instead of routing with an undefined role.
test('login waits for post-login session before deciding role redirect', () => {
  assert.match(loginPage, /waitForPostLoginSession/, 'login page should use a post-login session wait helper');
  assert.doesNotMatch(
    loginPage,
    /const session = await getSession\(\);\s*const redirectPath = getPostLoginRedirectPath\(session\?\.user\?\.role\)/,
    'login must not immediately route from a possibly undefined session role'
  );
  assert.match(loginPage, /setTimeout|Promise\(.*setTimeout|await new Promise/, 'session wait helper should retry briefly for mobile cookie propagation');
});

test('student fallback after successful login still full-loads deployed profile', () => {
  assert.match(loginPage, /PUBLIC_PROFILE_HREF/, 'student fallback should keep using deployed profile href');
  assert.match(loginPage, /window\.location\.assign\(PUBLIC_PROFILE_HREF\)/, 'student fallback should use a full document load');
});
