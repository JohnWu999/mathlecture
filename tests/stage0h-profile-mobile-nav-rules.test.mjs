import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const navbar = fs.readFileSync(path.join(root, 'components/navbar.tsx'), 'utf8');
const middleware = fs.readFileSync(path.join(root, 'middleware.ts'), 'utf8');
const profileApi = fs.readFileSync(path.join(root, 'app/api/user/profile/route.ts'), 'utf8');

function phoneBlock() {
  return navbar.match(/@media \(max-width: 620px\) \{[\s\S]*?\n        \}/)?.[0] ?? '';
}

test('profile page shell can open directly while profile API remains protected', () => {
  const matcherBlock = middleware.match(/matcher:\s*\[[\s\S]*?\]/)?.[0] ?? '';
  assert.doesNotMatch(matcherBlock, /"\/profile(?::\/path\*)?"|"\/profile"/, 'middleware should not intercept /profile page shell; page itself shows login/role guidance');
  assert.match(matcherBlock, /"\/api\/:path\*"/, 'protected profile data API should still be covered by API middleware');
  assert.match(profileApi, /if \(!user\)\s*\{[\s\S]*?status:\s*404/, 'profile API should handle stale sessions whose user no longer exists instead of returning null data that crashes the page');
});

test('phone navbar removes the folding menu button and right-aligns page-title text', () => {
  const block = phoneBlock();
  assert.match(block, /\.menu-button\s*\{[^}]*display:\s*none/, 'phone navbar should remove the folding menu button');
  assert.match(block, /\.mobile-menu\s*\{[^}]*display:\s*none/, 'phone dropdown menu should not appear on phones when page-title links are visible');
  assert.match(block, /\.forest-brand svg\s*\{[^}]*width:\s*18px[^}]*height:\s*12px/, 'phone Logo should be materially smaller and locked to 18x12');
  assert.match(block, /\.forest-brand svg\s*\{[^}]*max-width:\s*18px[^}]*max-height:\s*12px/, 'phone Logo should have max-size guards so it cannot render larger in mobile webviews');
  assert.match(block, /\.forest-brand svg\s*\{[^}]*flex:\s*0 0 18px/, 'phone Logo should not flex-grow inside the brand row');
  assert.match(block, /\.mobile-quick-links\s*\{[^}]*justify-content:\s*flex-end/, 'phone page-title text should align to the right');
  assert.match(block, /\.mobile-quick-links\s*\{[^}]*text-align:\s*right/, 'phone page-title text should use right text alignment');
});
