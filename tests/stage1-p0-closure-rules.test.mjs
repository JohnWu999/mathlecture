import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');

test('teacher answer review synchronizes status and reviewStatus so approved videos become visible to the question owner', () => {
  const source = read('app/api/teacher/answers/[id]/review/route.ts');
  assert.match(source, /data:\s*\{[^}]*status:\s*"APPROVED"[^}]*reviewStatus:\s*"APPROVED"/s, 'approve must set both Answer.status and Answer.reviewStatus to APPROVED');
  assert.match(source, /data:\s*\{[^}]*status:\s*"REJECTED"[^}]*reviewStatus:\s*"REJECTED"/s, 'reject must set both Answer.status and Answer.reviewStatus to REJECTED');
});

test('teacher pending answer queue excludes empty placeholder answers created at claim time', () => {
  const source = read('app/api/teacher/answers/route.ts');
  assert.match(source, /where:\s*\{[\s\S]*status:\s*"PENDING"[\s\S]*videoUrl:\s*\{\s*not:\s*""\s*\}/, 'pending teacher answer queue must only include submitted answers with a real videoUrl');
});

test('group collaboration API protects both reading and writing by membership, active project access, or staff role', () => {
  const source = read('app/api/groups/[id]/messages/route.ts');
  assert.match(source, /getServerSession\(authOptions\)/, 'group GET/POST must use session auth');
  assert.match(source, /assertGroupAccess/, 'group route should centralize access checks before reading or writing messages');
  assert.match(source, /role\s*===\s*"TEACHER"|role\s*===\s*"ADMIN"/, 'teacher/admin staff should be allowed for review and operations');
  assert.match(source, /groupMember\.findFirst/, 'group members should be allowed into their own collaboration space');
  assert.match(source, /userProjectAccess\.findFirst/, 'learners with active project access should be allowed into the project group');
  assert.match(source, /status:\s*"ACTIVE"/, 'only active project access should count');
  assert.match(source, /无权访问这个小组协作空间/, 'unauthorized users should receive a clear 403 message');
});

test('consultation QR upload is admin-only instead of any logged-in user uploading operational QR assets', () => {
  const source = read('app/api/uploads/route.ts');
  assert.match(source, /kind\s*===\s*"consultation-qr"[\s\S]*session\.user\.role\s*!==\s*"ADMIN"/, 'consultation-qr uploads must require ADMIN role');
  assert.match(source, /只有管理员可以上传咨询二维码/, 'non-admin consultation QR uploads should return a clear business error');
});
