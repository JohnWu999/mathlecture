import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { IDENTITY_PASSPORTS } from "../lib/growth-passport-ui-rules.mjs";

const profileSource = readFileSync(new URL("../app/profile/page.tsx", import.meta.url), "utf8");
const projectDetailSource = readFileSync(new URL("../app/projects/[id]/page.tsx", import.meta.url), "utf8");
const askSource = readFileSync(new URL("../app/qa/ask/page.tsx", import.meta.url), "utf8");

test("student profile keeps growth-energy privacy copy concise and removes teacher-only explanation block", () => {
  assert.equal(
    (profileSource.match(/只在成长护照里私密查看，不排名/g) || []).length,
    1,
    "个人中心只保留一次核心反排名说明，避免页面重复压迫。",
  );
  assert.doesNotMatch(profileSource, /给孩子和家长看的说明/);
  assert.doesNotMatch(profileSource, /<strong className="text-ink">老师：<\/strong>/);
  assert.match(profileSource, /成长护照说明/);
});

test("three identity trees use same-series progressive forest icons instead of unrelated emoji", () => {
  assert.deepEqual(
    IDENTITY_PASSPORTS.map((item) => item.iconClass),
    ["forest-icon-seed", "forest-icon-tree", "forest-icon-grove"],
  );
  assert.match(profileSource, /card\.iconClass/);
  assert.doesNotMatch(profileSource, /<div className="text-4xl">\{card\.icon\}<\/div>/);
});

test("project registration form inputs always render dark visible text", () => {
  assert.match(projectDetailSource, /placeholder="孩子昵称"[\s\S]*?className="[^"]*text-ink/);
  assert.match(projectDetailSource, /placeholder="年级，如 3"[\s\S]*?className="[^"]*text-ink/);
  assert.match(projectDetailSource, /value=\{packageName\}[\s\S]*?className="[^"]*text-ink/);
  assert.match(projectDetailSource, /placeholder="联系方式（可选）"[\s\S]*?className="[^"]*text-ink/);
  assert.match(projectDetailSource, /placeholder="想让老师了解的情况（可选）"[\s\S]*?className="[^"]*text-ink/);
});

test("question image upload is honest about OCR being a manual-review fallback until recognition service is wired", () => {
  assert.match(askSource, /当前内测先手动补充题目文字/);
  assert.match(askSource, /OCR/);
});
