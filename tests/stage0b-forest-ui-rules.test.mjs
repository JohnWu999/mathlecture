import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pages = [
  'app/qa/page.tsx',
  'app/qa/ask/page.tsx',
  'app/projects/page.tsx',
  'app/hall/page.tsx',
  'app/profile/page.tsx',
];

test('front pages use the shared forest page shell and high-fidelity hero treatment', () => {
  for (const rel of pages) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.match(src, /forest-page-shell/, `${rel} should opt into the shared forest visual shell`);
    assert.match(src, /forest-page-hero/, `${rel} should use a forest hero section instead of the old low-fi page header`);
    assert.match(src, /forest-panel|forest-card/, `${rel} should use forest panels/cards for the main content`);
  }
});

test('global forest UI tokens include page shell, hero, cards, mission panels, and empty states', () => {
  const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
  for (const className of ['forest-page-shell', 'forest-page-hero', 'forest-panel', 'forest-card', 'forest-empty', 'forest-mission-card']) {
    assert.match(css, new RegExp(`\\.${className}\\b`), `globals.css should define .${className}`);
  }
});

test('front page copy keeps the approved V2/V1 forest metaphors across product areas', () => {
  const joined = pages.map((rel) => fs.readFileSync(path.join(root, rel), 'utf8')).join('\n');
  for (const phrase of ['问题种子', '森林任务', '森林展墙', '成长护照', '不排名']) {
    assert.match(joined, new RegExp(phrase), `front page UI should include approved metaphor/copy: ${phrase}`);
  }
});
