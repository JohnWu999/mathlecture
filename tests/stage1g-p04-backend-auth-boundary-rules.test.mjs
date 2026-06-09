import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const loginBoundMutationRoutes = [
  { route: 'app/api/questions/route.ts', methods: ['POST'], bindsToSession: ['authorId: session.user.id'] },
  { route: 'app/api/answers/route.ts', methods: ['POST'], bindsToSession: ['lecturerId: session.user.id'] },
  { route: 'app/api/questions/[id]/claim/route.ts', methods: ['POST'], bindsToSession: ['lecturerId: session.user.id'] },
  { route: 'app/api/questions/[id]/heat/route.ts', methods: ['POST'], bindsToSession: ['userId: session.user.id'] },
  { route: 'app/api/answers/[id]/approve/route.ts', methods: ['POST'], bindsToSession: ['answer.question.authorId !== session.user.id'] },
  { route: 'app/api/projects/[id]/register/route.ts', methods: ['POST'], bindsToSession: ['userId: session.user.id'] },
  { route: 'app/api/uploads/route.ts', methods: ['POST'], bindsToSession: ['uploaderId: session.user.id'] },
  { route: 'app/api/groups/[id]/messages/route.ts', methods: ['POST'], bindsToSession: ['getServerSession(authOptions)'] },
  { route: 'app/api/outcomes/withdraw/route.ts', methods: ['POST'], bindsToSession: ['session.user.role === "TEACHER"'] },
  { route: 'app/api/teacher/questions/[id]/review/route.ts', methods: ['POST'], roleBound: 'TEACHER' },
  { route: 'app/api/teacher/answers/[id]/review/route.ts', methods: ['POST'], roleBound: 'TEACHER' },
  { route: 'app/api/teacher/outcomes/review/route.ts', methods: ['POST'], roleBound: 'TEACHER' },
  { route: 'app/api/teacher/activate/route.ts', methods: ['POST'], roleBound: 'TEACHER' },
  { route: 'app/api/teacher/projects/route.ts', methods: ['POST'], roleBound: 'TEACHER' },
  { route: 'app/api/admin/project-access/route.ts', methods: ['POST'], roleBound: 'ADMIN', usesRequireAdmin: true },
  { route: 'app/api/admin/registrations/[id]/route.ts', methods: ['PATCH'], roleBound: 'ADMIN', usesRequireAdmin: true },
  { route: 'app/api/admin/consultation-settings/route.ts', methods: ['POST'], roleBound: 'ADMIN', usesRequireAdmin: true },
];

const intentionallyPublicMutationRoutes = [
  'app/api/register/route.ts',
  'app/api/auth/[...nextauth]/route.ts',
];

function routeHasMethod(source, method) {
  return new RegExp(`export\\s+async\\s+function\\s+${method}\\b`).test(source);
}

function hasSessionRequirement(source) {
  return /getServerSession\(authOptions\)/.test(source) || /requireAdmin\(\)/.test(source);
}

test('stage1g P0-4 all state-changing API routes are classified as login-bound or intentionally public', () => {
  const apiRoot = path.join(repoRoot, 'app/api');
  const mutationRoutes = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      if (entry.isFile() && entry.name === 'route.ts') {
        const relative = path.relative(repoRoot, full).split(path.sep).join('/');
        const source = fs.readFileSync(full, 'utf8');
        if (/export\s+async\s+function\s+(POST|PATCH|PUT|DELETE)\b/.test(source)) mutationRoutes.push(relative);
      }
    }
  };
  walk(apiRoot);

  const classified = new Set([
    ...loginBoundMutationRoutes.map((item) => item.route),
    ...intentionallyPublicMutationRoutes,
  ]);
  const unclassified = mutationRoutes.filter((route) => !classified.has(route));
  assert.deepEqual(unclassified, [], `unclassified mutation routes must be reviewed before shipping: ${unclassified.join(', ')}`);
});

test('stage1g P0-4 login-bound mutation routes check session and return 401 before writes', () => {
  for (const item of loginBoundMutationRoutes) {
    const source = read(item.route);
    for (const method of item.methods) {
      assert.ok(routeHasMethod(source, method), `${item.route} should export ${method}`);
    }
    assert.ok(hasSessionRequirement(source), `${item.route} should call getServerSession(authOptions) or requireAdmin()`);
    if (item.usesRequireAdmin) {
      const helper = read('lib/admin-auth.ts');
      assert.match(helper, /status:\s*401/, `${item.route} should inherit HTTP 401 anonymous rejection from requireAdmin()`);
    } else {
      assert.match(source, /status:\s*401/, `${item.route} should return HTTP 401 for anonymous writes`);
    }
  }
});

test('stage1g P0-4 user-generated writes bind records or permissions to the session identity', () => {
  for (const item of loginBoundMutationRoutes.filter((route) => route.bindsToSession)) {
    const source = read(item.route);
    for (const expected of item.bindsToSession) {
      assert.ok(source.includes(expected), `${item.route} should include session-bound guard or write: ${expected}`);
    }
  }
});

test('stage1g P0-4 privileged mutation routes also enforce teacher/admin role boundaries', () => {
  for (const item of loginBoundMutationRoutes.filter((route) => route.roleBound)) {
    const source = read(item.route);
    if (item.usesRequireAdmin) {
      assert.match(source, /requireAdmin\(\)/, `${item.route} should use requireAdmin()`);
      const helper = read('lib/admin-auth.ts');
      assert.match(helper, /session\.user\.role !== "ADMIN"/, 'requireAdmin helper should reject non-admin users');
      assert.match(helper, /status:\s*403/, 'requireAdmin helper should return 403 for non-admin users');
    } else {
      assert.ok(source.includes(`session.user.role !== "${item.roleBound}"`) || source.includes(`session.user.role === "${item.roleBound}"`), `${item.route} should check ${item.roleBound} role`);
      assert.match(source, /status:\s*403/, `${item.route} should return 403 for wrong role`);
    }
  }
});
