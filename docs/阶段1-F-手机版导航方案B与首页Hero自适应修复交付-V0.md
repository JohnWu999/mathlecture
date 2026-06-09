# 阶段1-F｜手机版导航方案B与首页 Hero 自适应修复交付 V0

时间：2026-06-09 10:25 CST  
线上地址：http://159.75.144.28/math-young-lecturer  
当前状态：本地代码修复、规则测试、构建已完成；公网部署待恢复服务器 SSH/部署凭据后执行。

## 1. 用户反馈

犟爸反馈两处手机端问题：

1. 手机版导航 Logo 效果不符合已确认的“方案 B｜轻巧平衡”；
2. 手机版首页 Hero 区域内容框没有做到自适应，部分文字和框被屏幕吞掉。

## 2. 自检根因

### 2.1 手机版导航方案 B 偏差

检查 `components/navbar.tsx` 与 `app/globals.css` 后发现：

- 方案 B 的手机 Logo 图形尺寸为 `57px × 35px`；
- 但手机端品牌容器仍是 `76px`，并且局部样式缺少 `overflow: visible`；
- 手机端站名字距使用 `letter-spacing: 0.02em`，与方案 B 预览中的紧凑居中效果不一致；
- 全局兜底 CSS 也仍把手机品牌容器强制为 `76px`。

这会让手机端视觉看起来不像预览方案 B：Logo 与站名关系偏松，局部还可能出现栈式品牌被裁切的风险。

### 2.2 首页 Hero 手机端溢出

检查 `app/page.tsx` 后发现：

- 手机端 Hero 只有 `min-height:auto`，没有完整约束 padding、单列 grid、标题换行、视觉卡片宽度；
- 标题高亮短语 `.hi` 保留 `white-space: nowrap`，窄屏时会把标题撑出视口；
- `.world` 视觉框在手机端只设 `height:560px`，缺少 `width:100% / max-width:100%` 和按视口宽度自适应；
- `.question-card` 只设 `left/right/bottom/padding`，没有 `max-width: calc(100% - 24px)`，存在被容器吞掉或超出视觉框边界的风险。

## 3. 已完成代码修复

### 3.1 `components/navbar.tsx`

- 手机端 `.forest-brand` 宽度从 `76px` 调整为 `70px`，与方案 B 更一致；
- 保留手机 Logo 图形 `57px × 35px`；
- 增加 `overflow: visible`，避免 Logo/站名栈被裁切；
- 手机端 `brand-title` 字距改为 `letter-spacing: -0.02em`，回到方案 B 的紧凑居中效果。

### 3.2 `app/globals.css`

- 全局兜底 `.forest-site-nav .forest-brand` 增加 `overflow: visible !important`；
- 手机端全局兜底品牌容器从 `76px` 调整为 `70px`；
- 保持手机 Logo `57px × 35px`；
- 不恢复导航栏未登录态【登录】按钮。

### 3.3 `app/page.tsx`

手机端 Hero 增加完整自适应规则：

- `.hero`：改为 `padding: clamp(22px,6vw,30px) 14px 34px`，并允许 `overflow: visible`；
- `.hero-grid`：强制单列 `grid-template-columns: minmax(0,1fr)`；
- `h1`：改为 `font-size: clamp(32px,10.4vw,40px)`，并加 `overflow-wrap:anywhere`；
- `.hi`：允许换行，避免“长成一片数学森林”撑破屏幕；
- `.world`：设置 `width:100%`、`max-width:100%`、`height:clamp(430px,118vw,520px)`；
- `.question-card`：设置 `left/right:12px`、`max-width:calc(100% - 24px)`，防止卡片超出视觉框；
- 对 stage 气泡和路径图位置做手机端收紧，避免左右气泡被吞边。

## 4. 新增规则测试

新增：

```text
tests/stage1f-mobile-navbar-home-hero-fit-rules.test.mjs
```

覆盖两类回归：

1. 手机版导航必须保留方案 B 比例，品牌栈不能被裁切；
2. 手机版首页 Hero 必须单列自适应，标题可换行，视觉框和问题卡片不得超出屏幕。

已先运行旧代码确认测试红灯：

```text
node --test tests/stage1f-mobile-navbar-home-hero-fit-rules.test.mjs
```

结果：2 个子测试失败，分别命中手机品牌容器/字距问题与 Hero 自适应缺失问题。

## 5. 本地验证结果

修复后运行：

```text
node --test tests/stage1f-mobile-navbar-home-hero-fit-rules.test.mjs tests/stage1f-navbar-logo-login-home-rules.test.mjs tests/stage1f-navbar-visible-deploy-cache-rules.test.mjs tests/stage0f-background-nav-cleanup-rules.test.mjs tests/stage0h-profile-mobile-nav-rules.test.mjs tests/stage1f-nav-workspace-ui-rules.test.mjs tests/stage1f-single-personal-entry-nav-rules.test.mjs tests/stage1f-account-logout-rules.test.mjs && npm run build
```

结果：

- 相关规则测试：`24/24` 通过；
- `npm run build`：通过，Next.js 生产构建成功。

## 6. 部署状态说明

本轮我已完成本地代码修复、失败测试验证、修复后测试与生产构建。

但当前会话内尝试连接生产服务器 `159.75.144.28` 时，现有可用 SSH 身份均返回：

```text
Permission denied (publickey,password)
```

因此本轮尚未完成公网部署与 PM2 reload。为避免误报，我不把“本地修复已完成”说成“线上已部署”。

待服务器部署权限恢复后，需要执行：

1. 同步 standalone build 到 `/var/www/math-young-lecturer`；
2. 同步 `.next/static`、`public`、必要根目录 `node_modules`；
3. reload PM2 应用 `math-young-lecturer`；
4. 用手机 UA 公网验证首页、CSS/JS 内容与 no-store 缓存头。

## 7. 尚待公网验证清单

恢复部署权限后必须验证：

- `/math-young-lecturer`：200，no-store；
- 手机端首页 HTML/JS/CSS 含方案 B 手机规则：品牌容器 `70px`、Logo `57px × 35px`、`overflow: visible`；
- 首页 Hero 手机规则生效：`clamp(32px,10.4vw,40px)`、`.hi white-space: normal`、`.world width/max-width:100%`、`.question-card max-width:calc(100% - 24px)`；
- 导航栏未登录态仍不恢复【登录】按钮；
- `/login` 页面仍保留真实登录能力；
- `/teacher`、`/admin`、`/profile` 未登录仍 307 到 `/math-young-lecturer/login`。
