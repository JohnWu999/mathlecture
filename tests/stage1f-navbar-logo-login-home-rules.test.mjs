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

test("brand logo and title are a compact stacked unit on desktop and phone", () => {
  assert.match(
    navbar,
    /\.forest-brand\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*center[^}]*gap:\s*2px[^}]*max-width:\s*84px/s,
    "desktop brand should stack logo above title as one compact unit inside nav",
  );
  assert.match(
    navbar,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*34px[^}]*height:\s*21px[^}]*max-width:\s*34px[^}]*max-height:\s*21px[^}]*flex:\s*0 0 34px/s,
    "desktop logo should be locked to a smaller non-overflowing size",
  );
  assert.match(
    navbar,
    /\.forest-brand span\s*\{[^}]*font-size:\s*12px[^}]*line-height:\s*1\.05[^}]*white-space:\s*nowrap/s,
    "desktop brand title should stay compact under the logo",
  );
  assert.match(
    phoneBlock,
    /\.forest-brand\s*\{[^}]*align-items:\s*center[^}]*text-align:\s*center/s,
    "phone brand should use the same centered stacked logo-title visual",
  );
  assert.match(
    phoneBlock,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*28px[^}]*height:\s*17px[^}]*max-width:\s*28px[^}]*max-height:\s*17px[^}]*flex:\s*0 0 28px/s,
    "phone logo should be small but visible and locked so the brand does not overflow",
  );
});

test("login button has a more visible small border", () => {
  assert.match(
    navbar,
    /\.login,\s*\n\s*\.logout\s*\{[^}]*border:\s*1\.5px solid rgba\(24, 70, 56, 0\.34\)[^}]*box-shadow:\s*0 0 0 3px rgba\(255, 209, 102, 0\.18\)/s,
    "login/logout pills should have a clearer small border and subtle halo",
  );
});
