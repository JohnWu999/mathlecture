import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const frontPages = [
  'app/qa/page.tsx',
  'app/qa/ask/page.tsx',
  'app/projects/page.tsx',
  'app/hall/page.tsx',
  'app/profile/page.tsx',
];

const v2HexTokens = ['#FFF8EA', '#21483A', '#7EC85F', '#2F8F67', '#3B82F6', '#FFD166', '#F9733D', '#8B6B4A', '#D9E8D7'];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('global paging UI uses exact V2 color tokens and V1 soft surface language', () => {
  const css = read('app/globals.css');
  for (const hex of v2HexTokens) {
    assert.match(css, new RegExp(hex, 'i'), `globals.css should include V2 token ${hex}`);
  }
  for (const className of [
    'forest-v2-icon',
    'forest-icon-seed',
    'forest-icon-tree',
    'forest-icon-grove',
    'forest-info-card',
    'forest-note-card',
    'forest-visual-card',
    'forest-v2-pill',
    'forest-cover-glyph',
  ]) {
    assert.match(css, new RegExp(`\\.${className}\\b`), `globals.css should define .${className}`);
  }
});

test('front pages replace loose emoji/sticker headers with V2 micro-icons and V1 information cards', () => {
  for (const rel of frontPages) {
    const src = read(rel);
    assert.match(src, /forest-v2-icon|forest-cover-glyph/, `${rel} should use drawn V2 micro-icons instead of loose emoji-only decoration`);
    assert.match(src, /forest-info-card|forest-note-card|forest-visual-card/, `${rel} should use V1/V2 information card surfaces`);
    assert.doesNotMatch(src, /className="[^"]*sticker[^"]*"/, `${rel} should not use old sticker blocks for page-level information surfaces`);
  }
});

test('front page hero copy keeps V2 metaphors without overusing raw emoji glyphs', () => {
  const joined = frontPages.map(read).join('\n');
  for (const phrase of ['问题发芽', '讲解长高', '项目成林', '问题种子', '森林任务', '森林展墙']) {
    assert.match(joined, new RegExp(phrase), `front pages should retain V2 metaphor: ${phrase}`);
  }
  const rawEmojiMatches = joined.match(/[🌱🌳🌲🌿🛣️🎤🙋🔥✅]/gu) || [];
  assert.ok(rawEmojiMatches.length <= 2, `front pages should not rely on raw emoji icons; found ${rawEmojiMatches.length}`);
});
