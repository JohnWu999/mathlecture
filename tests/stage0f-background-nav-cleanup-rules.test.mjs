import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const globalsCss = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
const home = fs.readFileSync(path.join(root, 'app/page.tsx'), 'utf8');
const navbar = fs.readFileSync(path.join(root, 'components/navbar.tsx'), 'utf8');
const layout = fs.readFileSync(path.join(root, 'app/layout.tsx'), 'utf8');

const activePages = [
  'app/page.tsx',
  'app/qa/page.tsx',
  'app/qa/ask/page.tsx',
  'app/projects/page.tsx',
  'app/hall/page.tsx',
  'app/profile/page.tsx',
  'components/navbar.tsx',
  'app/layout.tsx',
];

test('active pages do not inject global body paper/doodle backgrounds that bleed into paged routes', () => {
  assert.doesNotMatch(home, /body:before|body:after|body\s*\{[^}]*background:/, 'homepage must not set global body background/pseudo backgrounds');
  assert.match(home, /\.forest-home::before/, 'homepage background should be scoped to .forest-home');
  assert.match(home, /\.forest-home::after/, 'homepage grid background should be scoped to .forest-home');
});

test('global default body background no longer uses old paper color as the site base', () => {
  const bodyBlock = globalsCss.match(/body\s*\{[^}]*\}/)?.[0] ?? '';
  assert.doesNotMatch(bodyBlock, /background-color:\s*var\(--paper-color\)/, 'body should not default to old --paper-color background');
  assert.match(bodyBlock, /background(?:-color)?:\s*var\(--v2-morning-paper/, 'body should default to V2 morning paper background');
});

test('root layout no longer mounts old global paper-grid or math-doodle background layers', () => {
  assert.doesNotMatch(layout, /paper-grid|math-doodle-bg|math-doodle-corner|math-doodle-mid/, 'RootLayout must not mount old background layers above paged routes');
});

test('active source files no longer rely on old paper/doodle background classes', () => {
  for (const rel of activePages) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.doesNotMatch(src, /paper-grid|math-doodle-bg|math-doodle-corner|crayon-texture|sticky-note|card-paper|btn-hand|border-hand/, `${rel} should not reference old paper/doodle visual classes`);
  }
});

test('mobile navbar exposes compact page-title links separated by vertical bars', () => {
  assert.match(navbar, /mobile-quick-links/, 'navbar should render compact mobile page-title links');
  assert.match(navbar, /<span className="mobile-separator" aria-hidden="true">｜<\/span>/, 'mobile page titles should be separated by fullwidth vertical bars');
  assert.match(navbar, /@media \(max-width: 620px\)[\s\S]*?\.mobile-quick-links\s*\{[\s\S]*?display:\s*flex/, 'mobile quick links should be visible on phones');
});

test('phone navbar stacks the brand vertically and gives page titles their own row to prevent overlap', () => {
  const phoneBlock = navbar.match(/@media \(max-width: 620px\) \{[\s\S]*?\n        \}/)?.[0] ?? '';
  assert.match(phoneBlock, /\.nav-inner\s*\{[^}]*grid-template-rows:\s*auto auto/, 'phone nav should use two rows: brand row and page-title row');
  assert.match(phoneBlock, /\.forest-brand\s*\{[^}]*flex-direction:\s*column/, 'phone brand should place title directly below the Logo');
  assert.match(phoneBlock, /\.forest-brand span\s*\{[^}]*display:\s*block/, 'phone brand text 数学小讲师联盟 should be visible under the Logo');
  assert.match(phoneBlock, /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*28px[^}]*height:\s*17px/, 'phone Logo should be compact, visible, and target the child SVG globally');
  assert.match(phoneBlock, /\.mobile-quick-links\s*\{[^}]*grid-column:\s*1 \/ -1/, 'phone page-title links should occupy a full-width row instead of sharing cramped space with the Logo');
  assert.match(phoneBlock, /\.mobile-quick-links\s*\{[^}]*overflow-x:\s*auto/, 'phone page-title row should allow horizontal scroll rather than text overlap on narrow screens');
});
