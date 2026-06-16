import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');

test('uploaded avatar and consultation QR images are served through a runtime upload route', () => {
  assert.ok(existsSync(new URL('app/uploads/[kind]/[filename]/route.ts', root)), 'runtime upload route should exist so UPLOAD_DIR files display in production');
  const route = read('app/uploads/[kind]/[filename]/route.ts');
  assert.match(route, /process\.env\.UPLOAD_DIR/, 'route should read the same UPLOAD_DIR used by upload API');
  assert.match(route, /readFile\(/, 'route should stream/read the stored upload file');
  assert.match(route, /image\/webp|image\/jpeg|image\/png/, 'route should return image content types for avatar and QR preview');
  assert.match(route, /consultation-qr|avatar/, 'route should explicitly allow avatar and consultation QR kinds');
});

test('project collaboration dates and Day progress are derived from learner start/access dates, not stale group creation time', () => {
  const route = read('app/api/groups/[id]/messages/route.ts');
  assert.match(route, /deriveLearnerProjectStartDate/, 'group API should derive a learner-specific project start date');
  assert.match(route, /membership\?\.joinedAt/, 'group API should prefer the current learner group joinedAt when present');
  assert.match(route, /activeProjectAccess\?\.validFrom|activeProjectAccess\?\.createdAt/, 'group API should fall back to current learner project access start date');
  assert.match(route, /projectRegistration\?\.createdAt/, 'group API should fall back to learner registration date');
  assert.match(route, /deriveCurrentProjectDay/, 'group API should derive current Day from start date and today');
  assert.doesNotMatch(route, /const startDate = access\.group\.createdAt;/, 'group API must not expose old group.createdAt as the visible learner start date');
});

test('teacher and admin drill-down controls expose selected labels and scroll/focus feedback after click', () => {
  const teacher = read('app/teacher/page.tsx');
  assert.match(teacher, /dashboardDetailRef/, 'teacher dashboard should keep a ref to the detail panel');
  assert.match(teacher, /handleSelectDashboardCard/, 'teacher dashboard card click should use a named handler, not only set state silently');
  assert.match(teacher, /aria-expanded=\{selectedDashboardCard === card\.label\}/, 'teacher metric buttons should expose expanded state');
  assert.match(teacher, /已展开：\{selectedDashboard\.label\}/, 'teacher detail panel should visibly confirm the selected card');

  const admin = read('app/admin/page.tsx');
  assert.match(admin, /countDetailRef/, 'admin count cards should keep a ref to the detail panel');
  assert.match(admin, /moduleDetailRef/, 'admin module cards should keep a ref to the module detail panel');
  assert.match(admin, /handleSelectCountCard/, 'admin count card click should use a named handler');
  assert.match(admin, /handleSelectWorkbenchSection/, 'admin module card click should use a named handler');
  assert.match(admin, /aria-expanded=\{selectedCountCard === card\.label\}/, 'admin count cards should expose expanded state');
  assert.match(admin, /已展开：\{selectedCount\.label\}/, 'admin data detail should visibly confirm the selected card');
  assert.match(admin, /已展开：\{selectedSection\?\.label\}/, 'admin module detail should visibly confirm the selected module');
});

test('teacher review cards give direct, absolute media/work links for videos and artifacts', () => {
  const teacher = read('app/teacher/page.tsx');
  assert.match(teacher, /normalizeReviewAssetUrl/, 'teacher page should normalize uploaded/internal media URLs for review links');
  assert.match(teacher, /href=\{normalizeReviewAssetUrl\(answer\.videoUrl\)\}/, 'answer review should open a normalized video URL');
  assert.match(teacher, /href=\{normalizeReviewAssetUrl\(outcome\.artifactUrl\)\}/, 'outcome review should open a normalized artifact URL');
  assert.match(teacher, /无法打开时请复制链接/, 'review UI should give a copy fallback when the browser cannot open the media');
});

test('new student registration supports preschool-to-grade-three and province/city selection, then opens basic participation by default', () => {
  const login = read('app/login/page.tsx');
  assert.match(login, /大班/, 'registration grade options should include 大班');
  assert.match(login, /三年级/, 'registration grade options should include 三年级');
  assert.match(login, /province/, 'registration should collect province separately');
  assert.match(login, /city/, 'registration should collect city separately');
  assert.match(login, /CHINA_PROVINCE_CITY_OPTIONS/, 'registration should use a China province/city option list');
  assert.match(login, /注册成功！已自动开放你问我答基础参与/, 'registration success copy should say basic Q&A participation is open');

  const route = read('app/api/register/route.ts');
  assert.match(route, /province/, 'register API should accept province');
  assert.match(route, /city/, 'register API should accept city');
  assert.match(route, /isActive:\s*true/, 'new student accounts should be active for basic participation by default');
  assert.doesNotMatch(route, /请等待老师开放权限后登录/, 'register API should no longer tell new students to wait for teacher activation');
});

test('free project registration copy does not imply teacher approval for joining once capacity allows it', () => {
  const projectPage = read('app/projects/[id]/page.tsx');
  assert.match(projectPage, /免费项目满人数即可成组/, 'project registration should explain free projects can form groups once capacity is met');
  assert.match(projectPage, /老师工作台只查看学习状态/, 'project registration should clarify teacher only observes/follows learning status');
});
