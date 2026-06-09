import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const criticalClientFlows = [
  'app/login/page.tsx',
  'app/teacher/page.tsx',
  'app/qa/question/[id]/page.tsx',
];

test('stage1f P0.5 critical client flows do not use browser alert/confirm/prompt for business feedback', () => {
  for (const relativePath of criticalClientFlows) {
    const source = read(relativePath);
    assert.doesNotMatch(source, /\balert\s*\(/, `${relativePath} must use in-page notice instead of alert()`);
    assert.doesNotMatch(source, /\bconfirm\s*\(/, `${relativePath} must use in-page confirmation state instead of confirm()`);
    assert.doesNotMatch(source, /\bprompt\s*\(/, `${relativePath} must not use prompt()`);
  }
});

test('login registration success uses an in-page success notice and keeps users on the login flow', () => {
  const source = read('app/login/page.tsx');
  assert.match(source, /const \[notice, setNotice\] = useState/, 'login page should keep success notice in React state');
  assert.match(source, /setNotice\(\s*"注册成功！请等待老师开放权限后登录"\s*\)/, 'registration success message should be written to notice state');
  assert.match(source, /mode === "login" \? "login" : "register"/, 'notice should expose status semantics for login/register modes');
  assert.match(source, /role="status"/, 'registration feedback should be rendered as accessible in-page status');
});

test('teacher workspace has a shared notice helper for review, authorization, and activation actions', () => {
  const source = read('app/teacher/page.tsx');
  assert.match(source, /type TeacherNotice/, 'teacher page should define typed notice state');
  assert.match(source, /const showTeacherNotice = \(message: string, type: TeacherNotice\["type"\] = "success"\)/, 'teacher page should centralize notice updates');
  assert.match(source, /role="status"/, 'teacher notice should be rendered as accessible in-page status');
  assert.match(source, /setActiveTab\("users"\)/, 'activation feedback should keep the teacher inside the users workflow');
  assert.match(source, /showTeacherNotice\([^\n]+"error"\)/, 'teacher failures should render error notices in page');
});

test('question detail acceptance uses a two-step in-page confirmation instead of blocking browser confirm', () => {
  const source = read('app/qa/question/[id]/page.tsx');
  assert.match(source, /const \[acceptingAnswerId, setAcceptingAnswerId\] = useState/, 'question detail should track which answer is being accepted');
  assert.match(source, /const handleAcceptAnswer = async \(answerId: string\)/, 'question detail should use a named accept handler');
  assert.match(source, /setAcceptingAnswerId\(answer\.id\)/, 'first click should open an in-page confirmation state');
  assert.match(source, /确认采纳这个讲解/, 'confirmation copy should be visible in the page');
  assert.match(source, /取消/, 'confirmation state should provide a cancel action');
});
