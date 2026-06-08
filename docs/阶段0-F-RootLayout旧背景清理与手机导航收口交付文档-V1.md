# 阶段0-F｜RootLayout 旧背景清理与手机导航收口交付文档 V1

项目：数学小讲师联盟  
日期：2026-06-08 21:58 CST  
状态：已完成代码、测试、构建、部署与线上验证

---

## 1. 本轮反馈

犟爸指出：

1. 分页背景依然有旧版本残留，之前问题没有真正解决；
2. 手机版首页导航栏太拥挤；
3. 分页标题之间可以用“｜”分隔。

本轮判断：反馈成立。上一轮 Stage0-E 只处理了分页壳层 CSS 与按钮填充，仍遗漏了更上层的全局布局背景来源。

---

## 2. 根因定位

### 2.1 旧背景真实来源

真实残留点不是分页 TSX，也不是 `.forest-page-shell` 本身，而是全局根布局：

`app/layout.tsx`

原代码在全站 `<body>` 上挂载了旧版背景：

- `className="min-h-screen paper-grid relative"`
- `<div className="math-doodle-bg" />`
- `<div className="math-doodle-corner-bl" />`
- `<div className="math-doodle-corner-br" />`
- `<div className="math-doodle-mid-left">+</div>`
- `<div className="math-doodle-mid-right">×</div>`

这些是旧手绘/方格纸/数学涂鸦背景层，属于全局层，覆盖范围高于分页。即使分页自己的 V2 背景已调整，这些 RootLayout 层仍会让页面看起来残留旧版本。

### 2.2 首页全局样式泄漏

`app/page.tsx` 里首页曾通过 `style jsx global` 设置：

- `body { background: var(--paper) }`
- `body:before`
- `body:after`

这类全局 body 背景在单页应用切换或 CSS 复用时也可能影响分页观感。本轮改为只作用于 `.forest-home`。

### 2.3 手机版导航拥挤原因

`components/navbar.tsx` 在手机宽度下保留：

- Logo 图形
- 品牌文字“数学小讲师联盟”
- 登录按钮
- 菜单按钮

但主分页入口被收到菜单里，首页顶部第一屏缺少紧凑的分页标题入口，导致手机导航既拥挤又不够清楚。

---

## 3. 修正内容

### 3.1 清理 RootLayout 旧背景

修改：`app/layout.tsx`

已移除：

- `paper-grid`
- `math-doodle-bg`
- `math-doodle-corner-bl`
- `math-doodle-corner-br`
- `math-doodle-mid-left`
- `math-doodle-mid-right`

现在 RootLayout 不再挂载旧版方格纸和数学涂鸦背景。

### 3.2 防御性禁用旧背景类

修改：`app/globals.css`

新增 Stage0-F 兜底规则：

- `.paper-grid` 不再输出背景色/背景图；
- `.math-doodle-*` 全部 `display: none`；
- 即便未来误用这些旧类，也不会再渲染旧背景。

### 3.3 首页背景改为局部作用域

修改：`app/page.tsx`

将首页背景从：

- `body`
- `body:before`
- `body:after`

改为：

- `.forest-home`
- `.forest-home::before`
- `.forest-home::after`

这样首页仍保持 V1 高保真森林背景，但不会再污染分页。

### 3.4 手机导航改为紧凑分页标题 + 竖线分隔

修改：`components/navbar.tsx`

新增手机分页快捷导航：

`你问我答｜项目营｜成果广场｜个人中心`

手机端处理：

- 隐藏品牌长文字，只保留 Logo；
- 隐藏登录/退出胶囊，避免挤占空间；
- 保留菜单按钮；
- 中间显示分页标题，用“｜”分隔；
- 当前页面仍保留 active 标识。

---

## 4. 新增测试

新增：

`tests/stage0f-background-nav-cleanup-rules.test.mjs`

覆盖：

1. 首页不再注入全局 `body` 背景；
2. 全局 body 不再使用旧 `--paper-color` 作为站点基础背景；
3. RootLayout 不再挂载 `paper-grid` / `math-doodle-*`；
4. 活跃页面不再主动使用旧背景类；
5. 手机导航存在 `mobile-quick-links`，并使用“｜”分隔分页标题。

---

## 5. 本地验证

完整验证链通过：

```bash
node --test tests/stage0f-background-nav-cleanup-rules.test.mjs
node --test tests/stage0e-background-button-cleanup-rules.test.mjs
node --test tests/stage0d-v2-visual-fidelity-rules.test.mjs
node --test tests/stage0b-forest-ui-rules.test.mjs
node --test tests/u0c-visual-consistency-rules.test.mjs
npm run build
```

结果：

- Stage0-F：5/5 pass
- Stage0-E：3/3 pass
- Stage0-D：3/3 pass
- Stage0-B：3/3 pass
- U0-C：3/3 pass
- Next.js build：通过

---

## 6. 部署与线上验证

代码提交：

`de0c1b2 stage0f: remove legacy backgrounds and compact mobile nav`

线上地址：

`http://159.75.144.28/math-young-lecturer`

部署后验证：

| 路径 | 状态 | paper-grid | math-doodle | 手机分页导航 | 竖线分隔 | basePath重复 |
|---|---:|---:|---:|---:|---:|---:|
| `/` | 200 | false | false | true | true | false |
| `/qa` | 200 | false | false | true | true | false |
| `/qa/ask` | 200 | false | false | true | true | false |
| `/projects` | 200 | false | false | true | true | false |
| `/hall` | 200 | false | false | true | true | false |
| `/login` | 200 | false | false | true | true | false |
| `/api/hall` | 200 | false | false | false | false | false |
| `/api/projects` | 200 | false | false | false | false | false |
| `/api/questions?status=OPEN` | 200 | false | false | false | false | false |

PM2：

- `math-young-lecturer`：online
- `unstable restarts`：0

---

## 7. 当前判断

本轮已经真正清掉了“分页旧背景残留”的根因：RootLayout 全局旧背景层。

现在可以进入下一阶段的条件更充分：

- 首页背景只在首页作用；
- 分页不再被 RootLayout 旧背景污染；
- 手机端导航不再塞满长品牌 + 登录按钮；
- 分页标题已用“｜”紧凑分隔。

建议：可以进入阶段1，但阶段1开始前仍建议犟爸用手机实际打开首页和 `/qa` 再做一次肉眼确认。如果仍有视觉残留，优先按截图定位，不再靠猜测。
