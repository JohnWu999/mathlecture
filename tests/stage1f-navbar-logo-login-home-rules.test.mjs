import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync(new URL("../components/navbar.tsx", import.meta.url), "utf8");
const phoneBlock = navbar.match(/@media \(max-width: 620px\) \{[\s\S]*?\n        \}/)?.[0] ?? "";

test("navbar adds 首页 before 你问我答 for returning from subpages", () => {
  assert.match(
    navbar,
    /const baseLinks = \[\s*\{ href: "\/", label: "首页" \},\s*\{ href: "\/qa", label: "你问我答" \}/,
    "首页 should be the first primary nav link before 你问我答",
  );
});

test("brand logo uses confirmed option B proportions above the centered title", () => {
  assert.match(
    navbar,
    /<span className="brand-title">数学小讲师联盟<\/span>/,
    "brand title should have a stable class for global cache-busting CSS overrides",
  );
  assert.match(
    navbar,
    /\.forest-brand\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*center[^}]*gap:\s*0[^}]*width:\s*78px[^}]*max-width:\s*78px/s,
    "desktop brand should stack logo exactly above title as one centered option-B unit",
  );
  assert.match(
    navbar,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*70px[^}]*height:\s*43px[^}]*max-width:\s*70px[^}]*max-height:\s*43px[^}]*flex:\s*0 0 43px/s,
    "desktop option-B logo should visually match the one-line brand title width",
  );
  assert.match(
    navbar,
    /\.forest-brand\s+\.brand-title\s*\{[^}]*font-size:\s*10px[^}]*line-height:\s*1\.05[^}]*white-space:\s*nowrap/s,
    "desktop brand title should sit tightly centered under the option-B logo",
  );
  assert.match(
    phoneBlock,
    /\.forest-brand\s*\{[^}]*align-items:\s*center[^}]*text-align:\s*center/s,
    "phone brand should use the same centered stacked logo-title visual",
  );
  assert.match(
    phoneBlock,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*57px[^}]*height:\s*35px[^}]*max-width:\s*57px[^}]*max-height:\s*35px[^}]*flex:\s*0 0 35px/s,
    "phone option-B logo should remain aligned with the title while saving vertical space",
  );
});

test("logged-out navbar removes the Login button while keeping real login routes reachable elsewhere", () => {
  assert.doesNotMatch(
    navbar,
    /<Link className="login" href="\/login">登录<\/Link>/,
    "logged-out navbar should not render the ugly standalone Login pill",
  );
  assert.match(
    navbar,
    /callbackUrl:\s*"\/math-young-lecturer\/login"/,
    "auth flow should still keep the real login page route for protected-entry redirects and logout callback",
  );
  assert.match(
    navbar,
    /\.logout\s*\{[^}]*border:\s*1\.5px solid rgba\(24, 70, 56, 0\.34\)/s,
    "logout may remain visible for signed-in users, but the logged-out Login pill is removed",
  );
});
