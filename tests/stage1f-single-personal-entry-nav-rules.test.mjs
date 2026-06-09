import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  getPersonalCenterHrefForRole,
  getVisibleWorkspaceNavForRole,
} from "../lib/role-access-boundary-rules.mjs";

const navbar = readFileSync(new URL("../components/navbar.tsx", import.meta.url), "utf8");

test("role-specific workspace links are not appended as extra navbar entries", () => {
  assert.deepEqual(getVisibleWorkspaceNavForRole("STUDENT"), [], "student should not add a second personal-center nav item");
  assert.deepEqual(getVisibleWorkspaceNavForRole("TEACHER"), [], "teacher should not add 老师工作台 beside 个人中心");
  assert.deepEqual(getVisibleWorkspaceNavForRole("ADMIN"), [], "admin should not add 管理员后台 beside 个人中心");
});

test("the single personal-center nav label routes by current role", () => {
  assert.equal(getPersonalCenterHrefForRole("STUDENT"), "/profile");
  assert.equal(getPersonalCenterHrefForRole("TEACHER"), "/teacher");
  assert.equal(getPersonalCenterHrefForRole("ADMIN"), "/admin");
  assert.equal(getPersonalCenterHrefForRole(undefined), "/profile", "unauthenticated personal center should still enter the login/profile guidance flow");
});

test("Navbar builds page links from the role-aware personal-center href only once", () => {
  assert.doesNotMatch(navbar, /const\s+links\s*=\s*\[\.\.\.mainLinks,\s*\.\.\.workspaceLinks\]/, "navbar should not append workspaceLinks after mainLinks");
  assert.doesNotMatch(navbar, /getVisibleWorkspaceNavForRole\(/, "navbar should not query extra workspace nav entries");
  assert.match(navbar, /label:\s*"个人中心"[\s\S]*href:\s*personalCenterHref/, "the visible personal-center nav item should use role-aware href");
  assert.match(navbar, /label:\s*"个人中心"[\s\S]*publicHref:\s*personalCenterPublicHref/, "student profile should keep the deployed-base full-document href path");
  assert.doesNotMatch(navbar, /label:\s*['"]老师工作台['"]/, "navbar source must not render a separate teacher workspace label");
  assert.doesNotMatch(navbar, /label:\s*['"]管理员后台['"]/, "navbar source must not render a separate admin workspace label");
});
