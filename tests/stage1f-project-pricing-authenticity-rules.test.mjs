import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  getProjectEnrollmentCopy,
  getProjectPriceDisplay,
  getProjectTypeLabel,
  normalizeProjectForPublicListing,
} from "../lib/project-camp-ui-rules.mjs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("public project normalizer downgrades PAID + zero price to free trial", () => {
  const project = normalizeProjectForPublicListing({
    id: "p0",
    title: "试运营项目",
    projectType: "PAID",
    price: 0,
  });

  assert.equal(project.projectType, "FREE");
  assert.equal(project.price, 0);
  assert.equal(project.publicPricingState, "FREE_TRIAL");
  assert.match(project.publicPricingNote, /试运营|免费体验|付费闭环暂未开放/);

  const type = getProjectTypeLabel(project.projectType, project);
  assert.equal(type.label, "基础项目");
  assert.doesNotMatch(type.helper, /付费|主题服务|价格|付款/);

  const enrollment = getProjectEnrollmentCopy(project);
  assert.equal(enrollment.priceLabel, "免费体验");
  assert.doesNotMatch(enrollment.helper, /立即付款|主题服务 ¥|付费/);

  const display = getProjectPriceDisplay(project);
  assert.equal(display.label, "免费体验");
  assert.equal(display.tone, "free");
});

test("positive-price paid projects remain paid guided services", () => {
  const project = normalizeProjectForPublicListing({
    id: "p1",
    title: "完整主题项目",
    projectType: "PAID",
    price: 9900,
  });

  assert.equal(project.projectType, "PAID");
  assert.equal(project.publicPricingState, "GUIDED_SERVICE");
  assert.equal(getProjectPriceDisplay(project).label, "主题服务 ¥99");
});

test("projects api returns normalized public project semantics", () => {
  const listRoute = read("app/api/projects/route.ts");
  const detailRoute = read("app/api/projects/[id]/route.ts");

  assert.match(listRoute, /normalizeProjectForPublicListing/);
  assert.match(listRoute, /projects\.map\(normalizeProjectForPublicListing\)/);
  assert.match(detailRoute, /normalizeProjectForPublicListing/);
  assert.match(detailRoute, /NextResponse\.json\(normalizeProjectForPublicListing\(project\)\)/);
});

test("project pages use normalized price display instead of ad-hoc PAID plus zero copy", () => {
  const listingPage = read("app/projects/page.tsx");
  const detailPage = read("app/projects/[id]/page.tsx");

  assert.match(listingPage, /normalizeProjectForPublicListing/);
  assert.match(listingPage, /getProjectPriceDisplay/);
  assert.doesNotMatch(listingPage, /p\.projectType === "FREE" \|\| p\.price === 0 \? "免费体验" : "主题服务"/);

  assert.match(detailPage, /normalizeProjectForPublicListing/);
  assert.match(detailPage, /publicPricingNote/);
});

test("project detail read api remains public while registration writes stay protected", () => {
  const guard = read("lib/api-guard.ts");
  assert.match(guard, /isPublicProjectReadPath/);
  assert.match(guard, /pathname === "\/api\/projects"/);
  assert.match(guard, /\/\^\\\/api\\\/projects\\\/\[\^\\\/\]\+\$\//);
  assert.match(guard, /if \(isPublicProjectReadPath\(pathname\)\) \{\s*return false;\s*\}/s);
  assert.match(guard, /"\/api\/projects\/"/);
});
