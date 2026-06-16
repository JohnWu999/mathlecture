import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const profilePage = read('app/profile/page.tsx');
const profileApi = read('app/api/user/profile/route.ts');
const uploadApi = read('app/api/uploads/route.ts');
const uploadRules = read('lib/upload-rules.mjs');
const teacherPage = read('app/teacher/page.tsx');
const questionsApi = read('app/api/questions/route.ts');
const answersApi = read('app/api/teacher/answers/route.ts');
const teacherDashboardApi = read('app/api/teacher/dashboard/route.ts');
const adminPage = read('app/admin/page.tsx');
const groupPage = read('app/groups/[id]/page.tsx');
const groupApi = read('app/api/groups/[id]/messages/route.ts');

test('student avatar upload is a real closed loop: upload kind, preview, save to profile, visible status', () => {
  assert.match(uploadRules, /'avatar'/, 'upload policies should include avatar kind');
  assert.match(uploadApi, /"avatar"/, 'upload API should accept avatar kind');
  assert.match(uploadApi, /kind === "avatar" && session\.user\.role !== "STUDENT"/, 'avatar uploads should be student-bound');
  assert.match(profileApi, /export async function PATCH/, 'profile API should let a student save uploaded avatar URL');
  assert.match(profileApi, /avatar:\s*true/, 'profile API GET should return current avatar');
  assert.match(profilePage, /type="file"[\s\S]*accept="image\/png,image\/jpeg,image\/webp"/, 'profile page should expose an actual image file picker');
  assert.match(profilePage, /form\.append\("kind", "avatar"\)/, 'profile page should upload using avatar kind');
  assert.match(profilePage, /method:\s*"PATCH"/, 'profile page should persist avatar URL through profile API');
  assert.match(profilePage, /头像已更新/, 'profile page should show visible success status');
});

test('teacher review workspace keeps approved questions and answers discoverable after clicking approve', () => {
  assert.match(teacherPage, /approvedQuestions/, 'teacher page should keep approved question archive state');
  assert.match(teacherPage, /reviewStatus=APPROVED/, 'teacher page should fetch approved questions, not only pending ones');
  assert.match(teacherPage, /已通过问题/, 'teacher workspace should expose an approved question archive tab or section');
  assert.match(teacherPage, /setApprovedQuestions\(\(prev\) => \[/, 'after approval, question should move into approved list immediately');
  assert.match(questionsApi, /recognizedText:\s*true/, 'teacher question archive should include recognized/manual text for review');
  assert.match(questionsApi, /imageUrl:\s*true/, 'teacher question archive should include uploaded image URL');
  assert.match(answersApi, /searchParams\.get\("view"\)/, 'teacher answers API should support pending/approved views');
  assert.match(teacherPage, /answerView/, 'teacher page should let teacher switch answer review archive view');
  assert.match(teacherPage, /已通过讲题/, 'teacher page should expose approved answer archive');
});

test('project collaboration space explains members, dates, deadline, and daily task update rule', () => {
  assert.match(groupApi, /members:\s*\{[\s\S]*include:\s*\{[\s\S]*user:/, 'group API should return member details, not only a count');
  assert.match(groupApi, /startDate/, 'group API should derive and return start date');
  assert.match(groupApi, /deadline/, 'group API should derive and return deadline');
  assert.match(groupPage, /成员名单/, 'group page should show visible member list');
  assert.match(groupPage, /开始时间/, 'group page should show project start date');
  assert.match(groupPage, /截止时间/, 'group page should show project deadline');
  assert.match(groupPage, /每天根据项目开始时间和当前 Day 更新任务卡/, 'group page should explain task card update rule');
});

test('teacher and admin dashboards have clickable drill-down cards with concrete data panels', () => {
  assert.match(teacherDashboardApi, /recentQuestions/, 'teacher dashboard API should return recent question details for drill-down');
  assert.match(teacherDashboardApi, /recentAnswers/, 'teacher dashboard API should return recent answer details for drill-down');
  assert.match(teacherDashboardApi, /pendingReviewItems/, 'teacher dashboard API should return pending review drill-down details');
  assert.match(teacherPage, /selectedDashboardCard/, 'teacher page should track selected dashboard card');
  assert.match(teacherPage, /查看明细/, 'teacher dashboard cards should advertise click-to-detail');
  assert.match(teacherPage, /数据明细/, 'teacher dashboard should render a detail panel');

  assert.match(adminPage, /selectedWorkbenchSection/, 'admin page should track selected backend module section');
  assert.match(adminPage, /selectedCountCard/, 'admin page should track selected top metric card');
  assert.match(adminPage, /查看具体内容/, 'admin overview/count cards should advertise click-to-detail');
  assert.match(adminPage, /模块明细/, 'admin module overview should render a concrete detail panel');
});
