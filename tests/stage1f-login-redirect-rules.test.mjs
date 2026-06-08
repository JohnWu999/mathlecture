import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const loginPage = fs.readFileSync(path.join(root, 'app/login/page.tsx'), 'utf8');

// Regression for mobile Safari / WeChat browser after entering from personal center:
// login success must not re-enter the fragile client-side /profile route.
test('student login success full-loads the deployed profile entry instead of router.push /profile', () => {
  assert.match(loginPage, /PUBLIC_PROFILE_HREF/, 'login page should know the deployed profile href');
  assert.match(loginPage, /window\.location\.(assign|href)\(?PUBLIC_PROFILE_HREF/, 'student login should full-load the deployed profile page');
  assert.doesNotMatch(loginPage, /router\.push\(getPostLoginRedirectPath\(session\?\.user\?\.role\)\)/, 'login should not blindly router.push the relative /profile path after student login');
});
