import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profileSource = readFileSync(new URL("../app/profile/page.tsx", import.meta.url), "utf8");

test("profile page imports every growth passport constant it renders after login", () => {
  assert.match(
    profileSource,
    /import\s*\{[\s\S]*GROWTH_ENERGY_SOURCES[\s\S]*\}\s*from\s*["']@\/lib\/growth-passport-ui-rules\.mjs["']/,
    "个人中心渲染成长能量来源列表时，必须显式导入 GROWTH_ENERGY_SOURCES，避免学生登录后客户端 ReferenceError。",
  );

  assert.match(
    profileSource,
    /import\s*\{[\s\S]*GROWTH_ENERGY_USES[\s\S]*\}\s*from\s*["']@\/lib\/growth-passport-ui-rules\.mjs["']/,
    "个人中心渲染成长能量用途列表时，必须显式导入 GROWTH_ENERGY_USES，避免学生登录后客户端 ReferenceError。",
  );
});
