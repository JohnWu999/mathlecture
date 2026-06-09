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
    /\.forest-brand\s*\{[^}]*flex-direction:\s*column[^}]*align-items:\s*center[^}]*gap:\s*0[^}]*max-width:\s*76px/s,
    "desktop brand should stack logo exactly above title as one tighter centered unit inside nav",
  );
  assert.match(
    navbar,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*26px[^}]*height:\s*16px[^}]*max-width:\s*26px[^}]*max-height:\s*16px[^}]*flex:\s*0 0 26px/s,
    "desktop logo should be locked smaller than the previous 34x21 size",
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
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*22px[^}]*height:\s*14px[^}]*max-width:\s*22px[^}]*max-height:\s*14px[^}]*flex:\s*0 0 22px/s,
    "phone logo should be smaller than the previous 28x17 size and locked so the brand does not overflow",
  );
});

test("logged-out login button has its own obvious border, not only the logout button", () => {
  assert.match(
    navbar,
    /\.login\s*\{[^}]*border:\s*2px solid #184638[^}]*box-shadow:\s*0 0 0 4px rgba\(255, 209, 102, 0\.28\)/s,
    "logged-out login pill should have an explicit, highly visible border of its own",
  );
  assert.match(
    navbar,
    /\.logout\s*\{[^}]*border:\s*1\.5px solid rgba\(24, 70, 56, 0\.34\)/s,
    "logout may remain visually consistent but should not be the only bordered account button",
  );
});
