import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const deepPages = [
  'app/login/page.tsx',
  'app/qa/question/[id]/page.tsx',
  'app/projects/[id]/page.tsx',
  'app/groups/[id]/page.tsx',
  'app/hall/[id]/page.tsx',
];

const workbenchPages = [
  'app/teacher/page.tsx',
  'app/admin/page.tsx',
];

test('U0-C deep routes share the forest shell and hero so clicking through does not fall back to the old UI', () => {
  for (const rel of deepPages) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.match(src, /forest-page-shell/, `${rel} should use the shared forest-page-shell`);
    assert.match(src, /forest-page-content/, `${rel} should use shared forest-page-content spacing`);
    assert.match(src, /forest-page-hero|forest-detail-hero/, `${rel} should expose a consistent forest hero/detail hero`);
    assert.match(src, /forest-panel|forest-card|forest-empty/, `${rel} should use shared panels/cards/empty states`);
  }
});

test('U0-C teacher and admin routes use a restrained guardian workbench shell instead of the old playful-only body', () => {
  for (const rel of workbenchPages) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8');
    assert.match(src, /forest-page-shell/, `${rel} should keep the same global page background`);
    assert.match(src, /guardian-workbench-shell/, `${rel} should use the restrained guardian workbench shell`);
    assert.match(src, /guardian-workbench-hero/, `${rel} should use a professional guardian workbench hero`);
    assert.match(src, /guardian-panel|guardian-card/, `${rel} should use professional panels/cards`);
    assert.match(src, /守林人工作台/, `${rel} should name the back office metaphor as 守林人工作台`);
  }
});

test('U0-C visual tokens define detail and guardian workbench treatments', () => {
  const css = fs.readFileSync(path.join(root, 'app/globals.css'), 'utf8');
  for (const className of [
    'forest-detail-hero',
    'forest-login-card',
    'guardian-workbench-shell',
    'guardian-workbench-hero',
    'guardian-panel',
    'guardian-card',
  ]) {
    assert.match(css, new RegExp(`\\.${className}\\b`), `globals.css should define .${className}`);
  }
});
