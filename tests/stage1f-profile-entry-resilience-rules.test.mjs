import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const profilePage = fs.readFileSync(path.join(root, 'app/profile/page.tsx'), 'utf8');
const projectsPage = fs.readFileSync(path.join(root, 'app/projects/page.tsx'), 'utf8');

test('profile entry waits for session state before showing login or loading profile data', () => {
  assert.match(profilePage, /const \{ data: session, status \} = useSession\(\)/, 'profile page should read next-auth status, not only session data');
  assert.match(profilePage, /status === "loading"/, 'profile page should show a loading state while next-auth is resolving instead of flashing a failure/login page');
  assert.match(profilePage, /if \(status !== "authenticated" \|\| !session\?\.user\)/, 'profile page should only treat the visitor as logged out after next-auth has resolved');
});

test('profile data fetch errors render an honest in-page fallback, not a generic error page', () => {
  assert.match(profilePage, /const \[profileError, setProfileError\]/, 'profile page should track API errors separately from loading');
  assert.match(profilePage, /setProfileError\(/, 'profile page should preserve an error message when the profile API fails');
  assert.match(profilePage, /个人中心暂时没有取到完整资料/, 'profile fallback should use clear product copy instead of “获取失败” only');
  assert.doesNotMatch(profilePage, /<div className="text-center py-20 text-ink-light">获取失败<\/div>/, 'profile page should not show a bare failure label');
});

test('profile lists tolerate incomplete historical records without client-side crashes', () => {
  assert.match(profilePage, /a\.question\?\.title \|\| "讲题记录待补全"/, 'answer history should tolerate missing or stale question records');
  assert.match(profilePage, /r\.project\?\.title \|\| "项目记录待补全"/, 'registration history should tolerate missing or stale project records');
});

test('project camp passport button keeps using the real profile route', () => {
  assert.match(projectsPage, /<Link href="\/profile"[\s\S]*查看我的成长护照/, 'project camp passport CTA should link to the personal center route handled by Next basePath');
});
