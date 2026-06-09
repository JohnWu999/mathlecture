import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const middleware = readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");

test("public pages that carry the navbar are no-store so users do not keep stale nav shells", () => {
  assert.match(
    middleware,
    /NO_STORE_PAGE_PATHS\s*=\s*new Set\(\[[\s\S]*"\/"[\s\S]*"\/qa"[\s\S]*"\/projects"[\s\S]*"\/hall"[\s\S]*"\/login"[\s\S]*"\/profile"/,
    "homepage and public navbar pages should be included in no-store page cache controls",
  );
  assert.match(
    middleware,
    /matcher:\s*\[[\s\S]*"\/"[\s\S]*"\/qa\/:path\*"[\s\S]*"\/projects\/:path\*"[\s\S]*"\/hall\/:path\*"/,
    "middleware must run on the homepage and public navbar pages so no-store headers are actually applied",
  );
});

test("global css carries a cache-busted navbar override for the visible login border and compact brand", () => {
  assert.match(
    css,
    /\.forest-site-nav\s+\.forest-brand\s*\{[\s\S]*width:\s*76px\s*!important[\s\S]*gap:\s*0\s*!important[\s\S]*text-align:\s*center\s*!important/,
    "global css should force the brand block to stay compact and centered even if an old JS nav style is cached",
  );
  assert.match(
    css,
    /\.forest-site-nav\s+\.forest-brand\s+\.brand-logo-mark\s*\{[\s\S]*width:\s*22px\s*!important[\s\S]*height:\s*14px\s*!important/,
    "global css should force an obviously smaller logo size",
  );
  assert.match(
    css,
    /\.forest-site-nav\s+\.login\s*\{[\s\S]*border:\s*2px solid #184638\s*!important[\s\S]*box-shadow:\s*0 0 0 4px rgba\(255, 209, 102, 0\.32\)\s*!important/,
    "global css should make the logged-out login button border visible independent of shared logout styles",
  );
});
