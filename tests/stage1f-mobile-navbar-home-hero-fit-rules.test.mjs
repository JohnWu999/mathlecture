import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const navbar = readFileSync(new URL("../components/navbar.tsx", import.meta.url), "utf8");
const home = readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
const globals = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
const phoneNavBlock = navbar.match(/@media \(max-width: 620px\) \{[\s\S]*?\n        \}/)?.[0] ?? "";
const phoneHomeBlock = home.match(/@media\(max-width:620px\)\{[\s\S]*?\}\s*@media\(prefers-reduced-motion:reduce\)/)?.[0] ?? "";

function assertOrdered(text, first, second, message) {
  const a = text.indexOf(first);
  const b = text.indexOf(second);
  assert.ok(a >= 0, `${message}: missing ${first}`);
  assert.ok(b >= 0, `${message}: missing ${second}`);
  assert.ok(a < b, message);
}

test("mobile navbar preserves option-B preview proportions without clipping the stacked logo", () => {
  assert.match(
    phoneNavBlock,
    /\.forest-brand\s*\{[^}]*width:\s*70px[^}]*max-width:\s*70px[^}]*min-width:\s*70px[^}]*overflow:\s*visible/s,
    "mobile brand box should match option-B preview width and must not clip the logo-title stack",
  );
  assert.match(
    phoneNavBlock,
    /\.forest-brand\s+:global\(\.brand-logo-mark\)\s*\{[^}]*width:\s*57px[^}]*height:\s*35px[^}]*flex:\s*0 0 35px/s,
    "mobile logo should keep the confirmed option-B 57x35 ratio",
  );
  assert.match(
    phoneNavBlock,
    /\.forest-brand\s+\.brand-title\s*\{[^}]*font-size:\s*9px[^}]*letter-spacing:\s*-0\.02em/s,
    "mobile title should use the same compact option-B title treatment as the preview",
  );
  assert.match(
    globals,
    /@media \(max-width:\s*620px\)\s*\{[\s\S]*\.forest-site-nav\s+\.forest-brand\s*\{[\s\S]*width:\s*70px\s*!important[\s\S]*overflow:\s*visible\s*!important/s,
    "global cache-busting CSS should enforce the same option-B mobile brand box",
  );
});

test("mobile homepage hero becomes a self-fitting column instead of swallowing text or cards", () => {
  assert.match(
    phoneHomeBlock,
    /\.hero\s*\{[^}]*padding:\s*clamp\(22px,6vw,30px\) 14px 34px[^}]*overflow:\s*visible/s,
    "mobile hero should use narrow adaptive padding and avoid clipping its content",
  );
  assert.match(
    phoneHomeBlock,
    /\.hero-grid\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,1fr\)[^}]*gap:\s*20px/s,
    "mobile hero grid should force a single minmax column so children can shrink to viewport",
  );
  assert.match(
    phoneHomeBlock,
    /h1\s*\{[^}]*font-size:\s*clamp\(32px,10\.4vw,40px\)[^}]*overflow-wrap:\s*anywhere/s,
    "mobile title should shrink and wrap instead of overflowing the viewport",
  );
  assert.match(
    phoneHomeBlock,
    /\.hi\s*\{[^}]*white-space:\s*normal[^}]*display:\s*inline/s,
    "highlighted title phrase must wrap on narrow phones",
  );
  assert.match(
    phoneHomeBlock,
    /\.world\s*\{[^}]*width:\s*100%[^}]*max-width:\s*100%[^}]*height:\s*clamp\(430px,118vw,520px\)[^}]*overflow:\s*hidden/s,
    "mobile visual card should be sized from viewport width and contained within the screen",
  );
  assert.match(
    phoneHomeBlock,
    /\.question-card\s*\{[^}]*left:\s*12px[^}]*right:\s*12px[^}]*max-width:\s*calc\(100% - 24px\)/s,
    "mobile question card should never extend beyond the hero visual card",
  );
  assertOrdered(phoneHomeBlock, ".hero{", ".world{", "mobile hero container rules should appear before visual card sizing rules");
});
