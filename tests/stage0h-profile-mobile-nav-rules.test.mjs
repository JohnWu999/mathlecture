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
  assert.match(matcherBlock, /"\/profile"/, 'middleware may cover /profile shell for cache-control, but must not force-login redirect it');
  assert.match(middleware, /NO_STORE_PAGE_PATHS[\s\S]*"\/profile"/, 'profile shell should be no-store so mobile browsers do not keep stale login/profile chunks');
  assert.match(matcherBlock, /"\/api\/:path\*"/, 'protected profile data API should still be covered by API middleware');
  assert.match(profileApi, /if \(!user\)\s*\{[\s\S]*?status:\s*404/, 'profile API should handle stale sessions whose user no longer exists instead of returning null data that crashes the page');
});

test('phone navbar removes the folding menu button and centers the compact brand/navigation block', () => {
  const block = phoneBlock();
  assert.match(block, /\.menu-button\s*\{[^}]*display:\s*none/, 'phone navbar should remove the folding menu button');
  assert.match(block, /\.mobile-menu\s*\{[^}]*display:\s*none/, 'phone dropdown menu should not appear on phones when page-title links are visible');
  assert.match(navbar, /<svg\s+className="brand-logo-mark"/, 'Logo SVG must carry an explicit class so styled-jsx can target the child component');
  assert.match(block, /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*57px[^}]*height:\s*35px/, 'phone option-B Logo should stay visible through a global logo selector');
  assert.match(block, /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*max-width:\s*57px[^}]*max-height:\s*35px[^}]*flex:\s*0 0 35px/, 'phone option-B Logo should lock max size and flex basis so it cannot be stretched');
  assert.match(block, /\.mobile-quick-links\s*\{[^}]*justify-content:\s*center/, 'phone page-title text should align with the centered compact brand block');
  assert.match(block, /\.mobile-quick-links\s*\{[^}]*text-align:\s*center/, 'phone page-title text should use centered text alignment');
});
