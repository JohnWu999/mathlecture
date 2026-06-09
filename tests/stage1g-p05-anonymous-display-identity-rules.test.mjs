import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');

const PUBLIC_ANONYMOUS_COPY = '公开展示时隐藏孩子姓名（后台仍会记录账号，方便老师反馈）';
const ANONYMOUS_DISPLAY_NAME = '匿名小朋友';

test('stage1g P0-5 centralizes anonymous display copy and display-name rule', () => {
  const source = read('lib/identity-display-rules.mjs');

  assert.match(source, /export const PUBLIC_ANONYMOUS_DISPLAY_COPY/, 'anonymous display copy should have one shared source of truth');
  assert.match(source, new RegExp(PUBLIC_ANONYMOUS_COPY), 'shared copy must clarify public display privacy and backend account tracking');
  assert.match(source, /export function getQuestionPublicAuthorDisplay/, 'public author display should be a shared helper');
  assert.match(source, /isAnonymous[\s\S]*?ANONYMOUS_QUESTION_AUTHOR_DISPLAY_NAME/, 'helper should return anonymous display name when isAnonymous is true');
  assert.match(source, /author\?\.name[\s\S]*?\|\|[\s\S]*?DEFAULT_QUESTION_AUTHOR_DISPLAY_NAME/, 'helper should fall back safely when no author name exists');
});

test('stage1g P0-5 public question list API returns display-safe author fields while preserving backend authorId binding', () => {
  const source = read('app/api/questions/route.ts');

  assert.match(source, /getQuestionPublicAuthorDisplay/, 'question list API should use the shared display helper');
  assert.match(source, /isAnonymous:\s*true/, 'question list API should explicitly select isAnonymous for display decisions');
  assert.match(source, /authorId:\s*session\.user\.id/, 'question creation must still bind authorId to the logged-in account');
  assert.match(source, /publicAuthorDisplayName/, 'public list response should expose a display-safe author name');
  assert.doesNotMatch(source, /return NextResponse\.json\(\{\s*questions,/, 'public list should not return raw question rows without display-safe mapping');
});

test('stage1g P0-5 question detail API applies anonymous display without dropping identity tracking', () => {
  const source = read('app/api/questions/[id]/route.ts');

  assert.match(source, /getQuestionPublicAuthorDisplay/, 'question detail API should use the shared display helper');
  assert.match(source, /maskQuestionAuthorForPublicDisplay/, 'question detail API should apply the shared mask helper for display decisions');
  assert.match(source, /const isOwner = session\?\.user\?\.id === question\.authorId/, 'detail route must retain backend ownership tracking by authorId');
  assert.match(source, /publicAuthorDisplayName/, 'detail response should expose a display-safe author name');
  assert.match(source, /canSeePrivateAuthor/, 'detail response should distinguish owner/teacher/admin from public viewers');
});

test('stage1g P0-5 frontend pages use display-safe author copy and explain anonymous means display privacy only', () => {
  const listPage = read('app/qa/page.tsx');
  const detailPage = read('app/qa/question/[id]/page.tsx');
  const askPage = read('app/qa/ask/page.tsx');

  assert.match(listPage, /publicAuthorDisplayName/, 'Q&A list should render the display-safe author name returned by the API');
  assert.doesNotMatch(listPage, /q\.author\.name \|\| "匿名小朋友"/, 'Q&A list must not decide anonymity from missing author name');
  assert.match(detailPage, /publicAuthorDisplayName/, 'question detail should render the display-safe author name returned by the API');
  assert.doesNotMatch(detailPage, /question\.isAnonymous \? "匿名小朋友" : question\.author\.name/, 'detail page should not duplicate anonymous display logic inline');
  assert.match(askPage, new RegExp(PUBLIC_ANONYMOUS_COPY), 'ask form should use the unified anonymous-display copy');
});
