import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const profileSource = readFileSync(new URL("../app/profile/page.tsx", import.meta.url), "utf8");
const navbarSource = readFileSync(new URL("../components/navbar.tsx", import.meta.url), "utf8");

test("student personal center exposes an in-page logout button for mobile and account switching", () => {
  assert.match(
    profileSource,
    /import\s*\{\s*useSession\s*,\s*signOut\s*\}\s*from\s*["']next-auth\/react["']/,
    "个人中心必须直接导入 signOut，避免手机端导航隐藏后没有退出登录入口。",
  );

  assert.match(
    profileSource,
    /<button[^>]+type=["']button["'][^>]+onClick=\{[^}]*signOut\(\{\s*callbackUrl:\s*["']\/math-young-lecturer\/login["']/s,
    "退出登录按钮应调用 NextAuth signOut，并退出后回到部署路径下的登录页。",
  );

  assert.match(
    profileSource,
    />\s*退出登录\s*<\/button>/,
    "按钮文案必须清楚写为“退出登录”，不能只写“退出”。",
  );
});

test("desktop account action also uses the explicit logout label", () => {
  assert.match(
    navbarSource,
    />\s*退出登录\s*<\/button>/,
    "桌面导航中的账户按钮也应显示“退出登录”，便于家长/孩子识别。",
  );
});
