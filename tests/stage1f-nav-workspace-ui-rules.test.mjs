import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const navbar = read("../components/navbar.tsx");
const teacher = read("../app/teacher/page.tsx");
const admin = read("../app/admin/page.tsx");
const css = read("../app/globals.css");

test("global navbar stays concise and removes the duplicate standalone ask CTA", () => {
  assert.match(navbar, /const baseLinks = \[[\s\S]*首页[\s\S]*你问我答[\s\S]*项目营[\s\S]*成果广场[\s\S]*\]/, "navbar should keep 首页 plus the shared primary page links");
  assert.match(navbar, /label:\s*"个人中心"[\s\S]*href:\s*personalCenterHref/, "navbar should keep one role-aware personal center entry");
  assert.doesNotMatch(navbar, /className="ask"[^>]*>我要提问<\/Link>/, "desktop nav should not add a separate 我要提问 pill beside login");
  assert.doesNotMatch(navbar, /className="mobile-ask"[^>]*>我要提问<\/Link>/, "mobile menu should not duplicate 我要提问 when 你问我答 already leads to the question flow");
  assert.doesNotMatch(navbar, /\.ask\s*\{/, "removed ask CTA should not leave dedicated nav CSS behind");
  assert.doesNotMatch(navbar, /\.mobile-menu \.mobile-ask\s*\{/, "removed mobile ask CTA should not leave dedicated nav CSS behind");
});

test("teacher workspace uses the latest forest visual system instead of old guardian/sticker surfaces", () => {
  assert.match(teacher, /forest-page-shell/, "teacher page keeps shared forest shell");
  assert.match(teacher, /forest-page-hero/, "teacher page should use the latest forest hero");
  assert.match(teacher, /forest-card-grid/, "teacher dashboard metrics should use forest card grids");
  assert.match(teacher, /forest-info-card|forest-note-card/, "teacher page should use V2 info/note cards for status guidance");
  assert.match(teacher, /forest-empty/, "teacher empty states should use shared forest empty style");
  assert.doesNotMatch(teacher, /guardian-workbench|guardian-panel|guardian-card/, "teacher page should not rely on old guardian workbench styling");
  assert.doesNotMatch(teacher, /className="[^"]*sticker/, "teacher page should not use old sticker card surfaces");
});

test("admin workspace uses the latest forest visual system instead of old guardian/sticker surfaces", () => {
  assert.match(admin, /forest-page-shell/, "admin page keeps shared forest shell");
  assert.match(admin, /forest-page-hero/, "admin page should use the latest forest hero");
  assert.match(admin, /forest-card-grid/, "admin count cards should use forest card grids");
  assert.match(admin, /forest-info-card|forest-note-card/, "admin page should use V2 info/note cards for status guidance");
  assert.match(admin, /forest-panel/, "admin operational modules should use forest panels");
  assert.doesNotMatch(admin, /guardian-workbench|guardian-panel|guardian-card/, "admin page should not rely on old guardian workbench styling");
  assert.doesNotMatch(admin, /className="[^"]*sticker/, "admin page should not use old sticker card surfaces");
});

test("workspace-specific CSS aliases map staff pages to V2 forest components", () => {
  assert.match(css, /\.forest-workspace-hero\s*\{[\s\S]*?border-radius:\s*46px/, "workspace hero should inherit the latest rounded V2 feeling");
  assert.match(css, /\.forest-dashboard-card\s*\{[\s\S]*?background:[\s\S]*?rgba\(255,254,249/, "metric cards should use soft V2 paper surfaces");
  assert.match(css, /\.forest-workspace-tabs/, "workspace tabs should have a V2-specific class instead of ad-hoc old pills");
});
