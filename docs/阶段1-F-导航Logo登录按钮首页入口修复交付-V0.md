# 阶段1-F｜导航 Logo、登录按钮与首页入口修复交付 V0

时间：2026-06-09 08:54 CST

## 1. 本轮反馈

犟爸提出导航栏三个体验问题：

1. 缩小网站 Logo 尺寸，确保 Logo 和下方“数学小讲师联盟”作为一个整体放进导航栏区域，不要溢出；网页版和手机版都要达到同样视觉效果。
2. 导航栏“登录”按钮加一个小边框，让用户更容易看到和发现。
3. 在导航栏“你问我答”前增加“首页”，方便用户浏览分页时切回首页。

## 2. 修复原则

- 不再通过额外按钮增加导航复杂度，只补齐必要的“回首页”路径。
- Logo 与“数学小讲师联盟”作为一个品牌整体处理：桌面端和手机端都采用上下堆叠、固定尺寸、居中对齐，避免 Logo 尺寸撑开导航栏。
- 登录按钮只加强可发现性，不做过重视觉抢占：使用小边框与轻微高亮描边。
- 保持上一轮阶段1-F原则：导航中仍不恢复独立【我要提问】按钮，不恢复登录后额外【老师工作台】/【管理员后台】入口；【个人中心】仍是唯一身份入口并按角色分流。

## 3. 代码改动

### 3.1 导航增加【首页】

文件：`components/navbar.tsx`

- `baseLinks` 增加 `{ href: "/", label: "首页" }`。
- 导航顺序调整为：
  - 首页
  - 你问我答
  - 项目营
  - 成果广场
  - 个人中心（唯一身份入口，仍按角色分流）

### 3.2 Logo 与站名整体缩小并锁定尺寸

文件：`components/navbar.tsx`

- 桌面端：
  - 品牌区固定为紧凑宽度；
  - Logo 锁定为约 `34px × 21px`；
  - “数学小讲师联盟”字号约 `12px`；
  - Logo 与文字上下堆叠、居中，整体不再横向或纵向溢出导航栏。
- 手机端：
  - 品牌区仍上下堆叠、居中；
  - Logo 锁定为约 `28px × 17px`；
  - 文字字号约 `11px`；
  - 导航区保持两行结构，品牌整体在第一行，页面入口在第二行，避免小屏拥挤溢出。

### 3.3 登录按钮加边框

文件：`components/navbar.tsx`

- 登录/退出按钮统一从弱边框调整为更清晰的小边框：`1.5px solid rgba(24, 70, 56, 0.34)`。
- 增加轻微高亮外描边，让【登录】更容易被发现，但不破坏整体 Forest 风格。

## 4. 防回归测试

新增：

- `tests/stage1f-navbar-logo-login-home-rules.test.mjs`

覆盖：

1. 导航必须在【你问我答】前新增【首页】；
2. 桌面端与手机端 Logo/站名必须为紧凑堆叠整体；
3. 手机端 Logo 尺寸锁定，不能被撑大；
4. 登录按钮必须有更明显的小边框；
5. 不得恢复登录后额外工作台入口。

同步更新旧规则测试：

- `tests/stage0f-background-nav-cleanup-rules.test.mjs`
- `tests/stage0h-profile-mobile-nav-rules.test.mjs`
- `tests/stage1f-nav-workspace-ui-rules.test.mjs`

## 5. 本地验证

已运行：

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

已按 worktree standalone 正确结构部署到公网环境，并 reload PM2 应用 `math-young-lecturer`。

部署后状态：

- PM2：`online`
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

线上 JS chunk 检查：

- 已包含【首页】且位于【你问我答】前；
- 已包含桌面端紧凑 Logo 尺寸规则；
- 已包含手机端紧凑 Logo 尺寸规则；
- 已包含登录按钮清晰边框与轻微高亮外描边；
- 仍未恢复 `workspaceLinks` / `getVisibleWorkspaceNavForRole` 额外角色入口逻辑。

说明：本地浏览器工具因当前容器 Chromium sandbox 限制无法启动，已改用公网 HTTP、权限跳转、线上 JS chunk 规则进行验证。

## 8. Git 提交

代码提交：

- `4b1bcb6 stage1f: refine navbar logo login and home link`

## 9. 当前结论

本轮不是只写文档，已同步完成：

- 代码修复；
- 防回归测试；
- production build；
- 公网部署；
- PM2 状态确认；
- 公网 HTTP 与线上 chunk 验证。

三个问题均已上线修复。
