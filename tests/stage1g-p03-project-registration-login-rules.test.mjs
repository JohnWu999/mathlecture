import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

test('stage1g P0-3 project detail keeps public introduction open but gates registration behind login', () => {
  const source = read('app/projects/[id]/page.tsx');

  assert.match(
    source,
    /const \{ data: session, status \} = useSession\(\)/,
    'project detail should read auth status so public browsing and registration login gates can be separated'
  );
  assert.match(source, /公开浏览不需要登录/, 'project introduction should explicitly remain public');
  assert.match(source, /报名和加入项目需要登录/, 'registration should be explained as login-bound');
  assert.match(source, /登录后报名/, 'unauthenticated registration CTA should be labeled as login-bound');
  assert.match(source, /登录后查看项目权益/, 'unauthenticated rights/access CTA should be labeled as login-bound');
  assert.match(source, /登录后提交项目成果/, 'unauthenticated artifact CTA should be labeled as login-bound');
  assert.match(source, /\/math-young-lecturer\/login\?callbackUrl=\/math-young-lecturer\/projects\//, 'login CTAs should preserve callback to the current project');
  const gateIndex = source.indexOf('{!isLoggedIn && status !== "loading" && (');
  const formIndex = source.indexOf('<form onSubmit={handleRegister}');
  assert.ok(gateIndex >= 0 && formIndex >= 0 && gateIndex < formIndex, 'unauthenticated login gate should appear before the full registration form branch');
  assert.doesNotMatch(source, /router\.push\(`\/login\?callbackUrl=\$\{encodeURIComponent\(pathname \|\| `\/projects\/\$\{id\}`\)\}`\)/, 'project detail should not silently redirect unauthenticated registration without explaining the login boundary');
});

test('stage1g P0-3 logged-in project registration form remains available for authenticated users', () => {
  const source = read('app/projects/[id]/page.tsx');

  assert.match(source, /isLoggedIn \? \([\s\S]*?<form onSubmit=\{handleRegister\}/, 'full registration form should remain inside the logged-in branch');
  assert.match(source, /孩子昵称/, 'logged-in registration form should still collect child nickname');
  assert.match(source, /年级，如 3/, 'logged-in registration form should still collect grade');
  assert.match(source, /项目报名意向/, 'logged-in registration form should still collect registration package/intent');
});

test('stage1g P0-3 project registration API requires session and binds registration to session user', () => {
  const source = read('app/api/projects/[id]/register/route.ts');

  assert.match(source, /getServerSession\(authOptions\)/, 'project registration route should check NextAuth session');
  assert.match(source, /if \(!session\?\.user\?\.id\)/, 'project registration route should reject missing users');
  assert.match(source, /status:\s*401/, 'project registration route should return 401 for anonymous writes');
  assert.match(source, /userId:\s*session\.user\.id/, 'project registration should be bound to the logged-in user');
});
