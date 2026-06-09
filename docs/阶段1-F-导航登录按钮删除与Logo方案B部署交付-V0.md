# 阶段1-F｜导航登录按钮删除与 Logo 方案 B 部署交付 V0

时间：2026-06-09 10:06 CST  
线上地址：http://159.75.144.28/math-young-lecturer

## 1. 本轮用户确认

犟爸选择预览方案：**方案 B｜轻巧平衡**。

本轮执行范围：

1. 从导航栏删除未登录态【登录】按钮；
2. 保留真实登录页和受保护入口跳转登录能力；
3. 将导航 Logo 调整为方案 B：Logo 与“数学小讲师联盟”上下居中，Logo 横向长度对应站名一行；
4. 更新全局 CSS 兜底，避免旧样式缓存恢复旧 Logo 或旧登录按钮边框；
5. 测试、build、部署并公网复验。

## 2. 代码修改

### 2.1 `components/navbar.tsx`

- 未登录态不再渲染导航栏独立【登录】按钮；
- 登录后仍保留账户入口和【退出登录】按钮；
- 站名增加稳定类名 `brand-title`，用于全局 CSS 兜底覆盖；
- Logo 按方案 B 调整：
  - 桌面：`70px × 43px`；
  - 手机：`57px × 35px`；
  - 品牌区：上下堆叠、居中、`gap: 0`。

### 2.2 `app/globals.css`

- 更新 Stage1-F 导航即时可见兜底覆盖；
- 全局 CSS 强制方案 B 品牌尺寸：
  - 默认/手机 Logo：`57px × 35px`；
  - 桌面 Logo：`70px × 43px`；
  - 品牌区：`78px`，居中；
- 删除旧 `.forest-site-nav .login` 强边框兜底，避免被缓存 CSS 恢复“难看登录按钮”的视觉。

### 2.3 测试更新

- `tests/stage1f-navbar-logo-login-home-rules.test.mjs`
- `tests/stage1f-navbar-visible-deploy-cache-rules.test.mjs`
- `tests/stage0f-background-nav-cleanup-rules.test.mjs`
- `tests/stage0h-profile-mobile-nav-rules.test.mjs`

测试规则覆盖：

1. 【首页】仍在【你问我答】前；
2. Logo/站名采用方案 B 比例；
3. 未登录态导航栏不再渲染【登录】按钮；
4. 登录页真实路由仍存在，受保护入口仍可跳转；
5. 全局 CSS 不再保留旧登录按钮强边框兜底；
6. 不恢复老师/管理员后台重复导航入口。

## 3. 本地验证

命令：

```bash
node --test \
  tests/stage1f-navbar-logo-login-home-rules.test.mjs \
  tests/stage1f-navbar-visible-deploy-cache-rules.test.mjs \
  tests/stage0f-background-nav-cleanup-rules.test.mjs \
  tests/stage0h-profile-mobile-nav-rules.test.mjs \
  tests/stage1f-nav-workspace-ui-rules.test.mjs \
  tests/stage1f-single-personal-entry-nav-rules.test.mjs \
  tests/stage1f-account-logout-rules.test.mjs \
  tests/role-access-boundary-rules.test.mjs
```

结果：**26/26 通过**。

命令：

```bash
npm run build
```

结果：**Next.js production build 通过**。

## 4. 部署

部署目标：`/var/www/math-young-lecturer`  
PM2 应用：`math-young-lecturer`

同步内容：

- `.next/standalone/.worktrees/batch9-review-authorization/` → 远端应用根目录；
- `.next/standalone/node_modules/` → 远端 `node_modules/`；
- `.next/static/` → 远端 `.next/static/`；
- `public/` → 远端 `public/`。

PM2 复验：

- status：`online`；
- unstable restarts：`0`；
- script path：`/var/www/math-young-lecturer/server.js`；
- exec cwd：`/var/www/math-young-lecturer`。

## 5. 公网复验

### 5.1 页面与缓存

| 路径 | 状态 | Cache-Control | 结果 |
|---|---:|---|---|
| `/math-young-lecturer` | 200 | no-store | 通过 |
| `/math-young-lecturer/qa` | 200 | no-store | 通过 |
| `/math-young-lecturer/projects` | 200 | no-store | 通过 |
| `/math-young-lecturer/hall` | 200 | no-store | 通过 |
| `/math-young-lecturer/login` | 200 | no-store | 通过 |

### 5.2 权限跳转

未登录直访：

| 路径 | 状态 | Location | 结果 |
|---|---:|---|---|
| `/math-young-lecturer/teacher` | 307 | `/math-young-lecturer/login` | 通过 |
| `/math-young-lecturer/admin` | 307 | `/math-young-lecturer/login` | 通过 |
| `/math-young-lecturer/profile` | 307 | `/math-young-lecturer/login` | 通过 |
| `/math-young-lecturer/api/user/profile` | 401 | - | 通过 |

### 5.3 线上 CSS/JS 内容核验

线上 CSS：`/math-young-lecturer/_next/static/css/999f4102e45290d6.css`

核验结果：

- 包含方案 B 品牌兜底：`width:78px!important`；
- 包含桌面 Logo：`width:70px!important`、`height:43px!important`；
- 不包含旧登录按钮强边框：`border:2px solid #184638!important`；
- 包含 `account-link`。

线上 JS chunk 核验：

- 包含 `brand-title`；
- 包含方案 B Logo 尺寸；
- 不包含未登录态导航 `href="/login"` + `登录` 渲染逻辑；
- 不包含 `className:"login"`；
- 保留退出登录回调 `/math-young-lecturer/login`。

## 6. 结论

本轮已完成：

1. 方案 B Logo/站名比例上线；
2. 导航栏未登录态【登录】按钮已删除；
3. 登录页和受保护入口跳转登录能力仍保留；
4. 测试通过、build 通过、部署完成、公网验证通过。

## 7. 阶段1-F后续仍待处理

本轮只处理犟爸确认的导航/Logo事项。阶段1-F剩余待办仍包括：

1. `/api/projects` 中 `projectType: "PAID"` + `price: 0` 的语义冲突；
2. 成果广场空状态；
3. 历史答案 `status/reviewStatus` 不一致；
4. 关键页面 `alert()` 替换为页面内状态反馈；
5. 阶段1-F最终总交付文档。
