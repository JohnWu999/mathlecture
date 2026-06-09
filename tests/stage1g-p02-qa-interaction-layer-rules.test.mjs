import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('stage1g P0-2 qa public page keeps browsing open but labels interactions as login-bound', () => {
  const source = read('app/qa/page.tsx');

  assert.match(
    source,
    /const \{ data: session, status \} = useSession\(\)/,
    'qa page should read auth status so public browsing and interactive login gates can be separated'
  );
  assert.match(source, /公开浏览不需要登录/, 'qa page should explicitly keep public browsing open');
  assert.match(source, /真实互动需要登录/, 'qa page should explain that real interactions require login');
  assert.match(source, /登录后提问/, 'ask CTA should be labeled as login-bound for unauthenticated users');
  assert.match(source, /登录后认领/, 'claim CTA should be labeled as login-bound for unauthenticated users');
  assert.match(source, /登录后加热度/, 'heat CTA should be labeled as login-bound for unauthenticated users');
  assert.match(source, /\/login\?callbackUrl=\/math-young-lecturer\/qa/, 'qa login CTA should use app-relative login path and preserve deployed callback to qa page');
  assert.doesNotMatch(source, /\/math-young-lecturer\/login\?callbackUrl=\/math-young-lecturer\/qa/, 'Next Link should not include basePath in its login href because Next will prefix basePath and create double-base URLs');
  assert.doesNotMatch(source, /router\.push\(`\/login\?callbackUrl=\$\{encodeURIComponent\(pathname \|\| "\/qa"\)\}`\)/, 'qa page should not silently redirect unauthenticated heat clicks without explaining the login boundary');
});

test('stage1g P0-2 question detail page separates public reading from login-bound heat, claim and answer actions', () => {
  const source = read('app/qa/question/[id]/page.tsx');

  assert.match(
    source,
    /const \{ data: session, status \} = useSession\(\)/,
    'question detail page should read auth status for login-bound interaction rendering'
  );
  assert.match(source, /公开浏览不需要登录/, 'question detail should explicitly keep reading open');
  assert.match(source, /真实互动需要登录/, 'question detail should explain that state-changing interactions require login');
  assert.match(source, /登录后加热度/, 'heat action should show a login-bound CTA for unauthenticated users');
  assert.match(source, /登录后认领这道题/, 'claim action should show a login-bound CTA for unauthenticated users');
  assert.match(source, /登录后提交讲解/, 'answer submission should show a login-bound CTA for unauthenticated users');
  assert.match(source, /\/login\?callbackUrl=\/math-young-lecturer\/qa\/question\//, 'detail login CTAs should use app-relative login path and preserve callback to the current question');
  assert.doesNotMatch(source, /\/math-young-lecturer\/login\?callbackUrl=\/math-young-lecturer\/qa\/question\//, 'Next Link should not include basePath in detail login href because Next will prefix basePath and create double-base URLs');
  assert.doesNotMatch(source, /router\.push\(`\/login\?callbackUrl=\$\{encodeURIComponent\(pathname \|\| `\/qa\/question\/\$\{id\}`\)\}`\)/, 'detail page should not silently redirect unauthenticated heat or claim clicks without explaining the login boundary');
});

test('stage1g P0-2 backend interaction APIs remain session-bound', () => {
  const heatSource = read('app/api/questions/[id]/heat/route.ts');
  const claimSource = read('app/api/questions/[id]/claim/route.ts');
  const answerSource = read('app/api/answers/route.ts');

  for (const [name, source] of [
    ['heat', heatSource],
    ['claim', claimSource],
    ['answer', answerSource],
  ]) {
    assert.match(source, /getServerSession\(authOptions\)/, `${name} route should check NextAuth session`);
    assert.match(source, /status:\s*401/, `${name} route should return 401 for anonymous writes`);
  }
});
