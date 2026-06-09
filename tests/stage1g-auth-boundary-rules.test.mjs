import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('stage1g P0-1 ask page shows login gate before the question form for unauthenticated users', () => {
  const source = read('app/qa/ask/page.tsx');

  assert.match(
    source,
    /const \{ data: session, status \} = useSession\(\)/,
    'ask page should read session status so it can distinguish loading from unauthenticated users'
  );
  assert.match(
    source,
    /if \(status !== "loading" && !session\?\.user\) \{[\s\S]*?return \(/,
    'ask page should return a dedicated unauthenticated login gate before rendering the editable form'
  );
  assert.match(
    source,
    /登录后提问/,
    'unauthenticated gate should clearly label that asking requires login'
  );
  assert.match(
    source,
    /老师讲解完成后[\s\S]*?反馈准确推送给你/,
    'unauthenticated gate should explain that login lets teachers push feedback back to the asker'
  );
  assert.match(
    source,
    /callbackUrl=\/math-young-lecturer\/qa\/ask/,
    'login link should preserve a callback back to the ask page'
  );

  const gateIndex = source.indexOf('if (status !== "loading" && !session?.user)');
  const formIndex = source.indexOf('<form onSubmit={handleSubmit}');
  assert.ok(gateIndex >= 0 && formIndex >= 0 && gateIndex < formIndex, 'login gate must appear before the editable question form');
});

test('stage1g P0-1 ask page uses anonymous display copy, not anonymous participation copy', () => {
  const source = read('app/qa/ask/page.tsx');

  assert.doesNotMatch(
    source,
    /匿名提问（保护提问安全感）/,
    'anonymous copy must not imply unregistered/anonymous participation'
  );
  assert.match(
    source,
    /公开展示时隐藏孩子姓名/,
    'anonymous option should be reframed as public display privacy'
  );
  assert.match(
    source,
    /后台仍会记录账号/,
    'anonymous option should clarify that the backend still tracks the account for feedback'
  );
});

test('stage1g P0-1 question creation API requires session and writes authorId from session', () => {
  const source = read('app/api/questions/route.ts');

  assert.match(source, /export async function POST/, 'question creation route should expose POST');
  assert.match(source, /getServerSession\(authOptions\)/, 'question creation must check NextAuth session');
  assert.match(source, /if \(!session\?\.user\?\.id\)/, 'question creation must reject missing users');
  assert.match(source, /status:\s*401/, 'question creation must return 401 for anonymous writes');
  assert.match(source, /authorId:\s*session\.user\.id/, 'created questions must be bound to the logged-in user');
});
