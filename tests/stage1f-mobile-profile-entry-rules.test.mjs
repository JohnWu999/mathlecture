import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const navbar = fs.readFileSync(path.join(root, 'components/navbar.tsx'), 'utf8');
const projectsPage = fs.readFileSync(path.join(root, 'app/projects/page.tsx'), 'utf8');

const deployProfileHrefPattern = /PUBLIC_PROFILE_HREF|DEPLOY_PROFILE_HREF|\/math-young-lecturer\/profile/;

test('mobile personal-center navigation uses a deploy-base full document href for profile', () => {
  assert.match(navbar, deployProfileHrefPattern, 'navbar should keep a deploy-base profile href for mobile Safari/full document fallback');
  assert.match(navbar, /<a[^>]+href=\{link\.publicHref\}[\s\S]+\{link\.label\}/, 'the personal center nav entry should render through an anchor href that can full-load the deployed /profile page');
});

test('project-camp passport CTA uses the same deploy-base full document href', () => {
  assert.match(projectsPage, deployProfileHrefPattern, 'project camp should keep a deploy-base profile href');
  assert.match(projectsPage, /<a\s+href=\{[^}]*PROFILE[^}]*\}[\s\S]*查看我的成长护照/, 'passport CTA should use an anchor href, not only client-side Link navigation');
});
