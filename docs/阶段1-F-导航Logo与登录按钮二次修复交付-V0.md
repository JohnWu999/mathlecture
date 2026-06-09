# 阶段1-F｜导航 Logo 与登录按钮二次修复交付 V0

时间：2026-06-09 09:27 CST

## 1. 本轮反馈

犟爸复核后指出：

1. 网站 Logo 尺寸仍偏大；
2. “数学小讲师联盟”几个字需要居中放在 Logo 正下方，间距不要太宽；
3. 只看到了【退出登录】按钮有边框，没有看到【登录】按钮的边框，需要自检并修复。

## 2. 自检结论

本轮自检确认：上一版虽然已经把品牌区改为上下堆叠，但 Logo 视觉仍偏大，且品牌区宽度与上下间距仍可以继续收紧；【登录】和【退出登录】上一版共用同一组弱边框规则，在真实视觉里【登录】边框不够明显，容易被误认为没有边框。

因此本轮做二次收紧，不再只依赖登录/退出共用样式，而是给【登录】单独设置更明显的边框规则。

## 3. 代码修复

文件：`components/navbar.tsx`

### 3.1 Logo 与站名进一步收紧

- 桌面端品牌整体：
  - 品牌区宽度从约 `84px` 收紧到 `76px`；
  - Logo 从约 `34px × 21px` 缩小到约 `26px × 16px`；
  - Logo 与“数学小讲师联盟”间距从 `2px` 收紧到 `0`；
  - 标题仍居中、单行、直接位于 Logo 正下方。

- 手机端品牌整体：
  - 品牌区宽度同步收紧到 `76px`；
  - Logo 从约 `28px × 17px` 缩小到约 `22px × 14px`；
  - Logo 与文字间距同步收紧到 `0`；
  - 仍保持居中上下堆叠，避免溢出导航栏。

### 3.2 【登录】按钮独立强化边框

- 【登录】按钮不再只依赖 `.login, .logout` 共用弱边框；
- 新增 `.login` 单独样式：
  - `border: 2px solid #184638`；
  - `box-shadow: 0 0 0 4px rgba(255, 209, 102, 0.28)`；
  - 背景调整为更干净的浅色底，保证登录态未登录时更容易被看到。
- 【退出登录】保留较轻边框，避免两个按钮同时过重。

## 4. 防回归测试

更新：

- `tests/stage1f-navbar-logo-login-home-rules.test.mjs`

新增/强化断言：

1. 桌面端品牌区必须收紧为 `76px`；
2. 桌面端 Logo 必须缩小并锁定为 `26px × 16px`；
3. 手机端 Logo 必须缩小并锁定为 `22px × 14px`；
4. Logo 与站名间距必须为 `0`，确保“数学小讲师联盟”居中贴近 Logo 正下方；
5. 【登录】必须拥有单独的强边框规则，不能只让【退出登录】有明显边框。

同步更新：

- `tests/stage0f-background-nav-cleanup-rules.test.mjs`
- `tests/stage0h-profile-mobile-nav-rules.test.mjs`

## 5. 本地验证

已先运行新规则确认红灯：

- 旧代码下 `stage1f-navbar-logo-login-home-rules.test.mjs` 失败，失败点正是 Logo 仍为旧尺寸、【登录】缺少单独强边框。

修复后运行：

```bash
node --test \
  tests/stage1f-navbar-logo-login-home-rules.test.mjs \
  tests/stage0f-background-nav-cleanup-rules.test.mjs \
  tests/stage0h-profile-mobile-nav-rules.test.mjs \
  tests/stage1f-nav-workspace-ui-rules.test.mjs \
  tests/stage1f-single-personal-entry-nav-rules.test.mjs \
  tests/stage1f-mobile-profile-entry-rules.test.mjs \
  tests/stage1f-account-logout-rules.test.mjs \
  tests/u0c-visual-consistency-rules.test.mjs \
  tests/role-access-boundary-rules.test.mjs
```

结果：

- 29/29 通过。

已运行：

```bash
npm run build
```

结果：

- Next.js production build 通过。

## 6. 部署上线

代码提交：

- `88e6427 stage1f: tighten navbar brand and login border`

已按 worktree standalone 正确结构部署到公网环境，并 reload PM2 应用：

- PM2 应用：`math-young-lecturer`
- 状态：`online`
- script path：`/var/www/math-young-lecturer/server.js`
- exec cwd：`/var/www/math-young-lecturer`

## 7. 公网验证

公网地址：`http://159.75.144.28/math-young-lecturer`

HTTP 与权限边界验证：

- `/math-young-lecturer/`：跟随跳转后 200
- `/math-young-lecturer/qa`：200
- `/math-young-lecturer/login`：200
- `/math-young-lecturer/teacher`：未登录 307 到 `/math-young-lecturer/login`
- `/math-young-lecturer/admin`：未登录 307 到 `/math-young-lecturer/login`

线上 JS chunk 验证：

- 已包含【首页】位于【你问我答】前；
- 已包含桌面端更紧凑品牌规则：`max-width:76px`、Logo `26px × 16px`、`gap:0`；
- 已包含手机端更紧凑品牌规则：Logo `22px × 14px`；
- 已包含【登录】独立强边框：`border:2px solid #184638`；
- 已包含【登录】高亮外描边；
- 【退出登录】仍保留边框；
- 仍未恢复 `workspaceLinks` / `getVisibleWorkspaceNavForRole` 额外角色入口逻辑。

## 8. 当前结论

本轮已完成二次修复并上线：

- Logo 进一步缩小；
- “数学小讲师联盟”居中贴在 Logo 正下方，间距收窄；
- 【登录】按钮有单独、明显的小边框；
- 已测试、build、部署并公网验证。
