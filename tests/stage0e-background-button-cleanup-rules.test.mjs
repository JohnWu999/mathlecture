import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');

const frontPages = [
  'app/qa/page.tsx',
  'app/qa/ask/page.tsx',
  'app/projects/page.tsx',
  'app/hall/page.tsx',
  'app/profile/page.tsx',
];

function read(rel) {
  return fs.readFileSync(path.join(root, rel), 'utf8');
}

test('front paging background no longer contains old Stage0-B paper/crayon residue', () => {
  assert.doesNotMatch(css, /linear-gradient\(180deg,\s*#fbfbf2\s*0%,\s*#f7f0df\s*100%\)/i, 'old beige paper gradient should be removed from forest-page-shell');
  assert.doesNotMatch(css, /content:\s*"∞\s+△\s+\+\s+7\s+⟂\s+○"/, 'old fixed math glyph background should be removed from forest-page-shell::before');
  assert.match(css, /\.forest-page-shell\s*\{[\s\S]*?background:[\s\S]*?var\(--v2-morning-paper\)[\s\S]*?#EEF9E8[\s\S]*?;/, 'forest-page-shell should use the V2/V1 morning-paper forest background as the single authoritative paging background');
});

test('front page button surfaces are filled by the same rounded capsule as the button frame', () => {
  assert.match(css, /\.hand-btn\s*\{[\s\S]*?overflow:\s*hidden\s*!important;[\s\S]*?background-clip:\s*border-box\s*!important;/, 'hand-btn should clip the fill to the whole capsule frame');
  assert.match(css, /\.hand-btn::before\s*\{[\s\S]*?display:\s*none\s*!important;/, 'old inner pseudo-border should be disabled so it cannot create an unfilled frame');
  assert.match(css, /\.hand-btn\[class\*="bg-crayon-green"\]/, 'green Tailwind-style button classes, including opacity variants, should be force-filled');
  assert.match(css, /\.hand-btn\[class\*="bg-crayon-yellow"\]/, 'yellow Tailwind-style button classes, including opacity variants, should be force-filled');
  assert.match(css, /\.hand-btn\[class\*="bg-crayon-blue"\]/, 'blue Tailwind-style button classes, including opacity variants, should be force-filled');
  assert.match(css, /\.hand-btn\.bg-white/, 'white buttons should have a filled V2 paper surface');
});

test('front pages still use the V2 shell and do not opt into old paper-grid backgrounds', () => {
  for (const rel of frontPages) {
    const src = read(rel);
    assert.match(src, /forest-page-shell/, `${rel} should keep the V2 paging shell`);
    assert.doesNotMatch(src, /paper-grid|math-doodle|crayon-texture/, `${rel} should not opt into old paper/doodle/crayon backgrounds`);
  }
});
