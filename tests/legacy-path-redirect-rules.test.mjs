import test from "node:test";
import assert from "node:assert/strict";
import { getLegacyPathRedirectTarget, shouldRedirectLegacyPath } from "../lib/legacy-path-redirect-rules.mjs";

test("redirects bare legacy login and teacher paths into the deployed base path", () => {
  assert.equal(getLegacyPathRedirectTarget("/login"), "/math-young-lecturer/login");
  assert.equal(getLegacyPathRedirectTarget("/teacher"), "/math-young-lecturer/teacher");
  assert.equal(getLegacyPathRedirectTarget("/profile"), "/math-young-lecturer/profile");
});

test("preserves nested path and query when redirecting legacy routes", () => {
  assert.equal(
    getLegacyPathRedirectTarget("/qa/question/abc?from=share"),
    "/math-young-lecturer/qa/question/abc?from=share"
  );
});

test("does not redirect already-correct base path or unrelated assets", () => {
  assert.equal(shouldRedirectLegacyPath("/math-young-lecturer/login"), false);
  assert.equal(shouldRedirectLegacyPath("/_next/static/app.js"), false);
  assert.equal(shouldRedirectLegacyPath("/favicon.ico"), false);
});

test("does not redirect requests that Next.js has already matched under the deployed base path", () => {
  assert.equal(
    getLegacyPathRedirectTarget("/teacher", { requestBasePath: "/math-young-lecturer" }),
    null
  );
});
