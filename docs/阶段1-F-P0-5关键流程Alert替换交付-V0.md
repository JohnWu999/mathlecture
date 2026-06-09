# 阶段1-F P0.5｜关键流程 alert 替换为页面内状态反馈交付 V0

更新时间：2026-06-09 13:12 CST  
公网地址：http://159.75.144.28/math-young-lecturer

---

## 1. 本轮目标

阶段1-F 的验收口径不是“页面能点”，而是第一批真实试运营用户在关键流程里能看到真实动作、明确状态反馈或诚实降级说明。

本轮 P0.5 聚焦三类高频关键流程：

1. 注册成功后的等待开放权限反馈；
2. 老师工作台的问题审核、讲题审核、成果审核、公开授权撤回、学生基础参与开关；
3. 问题详情页提问者采纳讲解前的确认动作。

修复目标：不再依赖浏览器 `alert()` / `confirm()` / `prompt()` 作为业务反馈，而是改为页面内 notice / status / 二次确认区域。

---

## 2. 修复范围

### 2.1 登录 / 注册页

文件：`app/login/page.tsx`

修复前：

- 注册成功后使用 `alert("注册成功！请等待老师开放权限后登录")`；
- 弹窗关闭后才回到登录态；
- 用户无法在页面中保留这条业务状态。

修复后：

- 新增 `notice` React 状态；
- 注册成功后写入页面内状态条：`注册成功！请等待老师开放权限后登录`；
- 自动切换回登录模式，用户留在真实登录流程中；
- notice 使用 `role="status"`，作为可访问的页面内状态反馈。

### 2.2 老师工作台

文件：`app/teacher/page.tsx`

修复前：

- 问题审核、讲题审核、成果审核、撤回公开授权、学生状态开关大量依赖 `alert()`；
- 成功/失败反馈是浏览器弹窗，不是工作台内状态；
- 运营老师无法在当前页面保留操作反馈。

修复后：

- 新增 `TeacherNotice` 类型与统一 `showTeacherNotice()` helper；
- 成功状态使用绿色/信息状态条；
- 失败状态使用错误状态条；
- 学生基础参与开关后保持在学生状态工作流内；
- 所有关键老师操作都用页面内 notice 承接反馈。

### 2.3 问题详情页采纳讲解

文件：`app/qa/question/[id]/page.tsx`

修复前：

- 提问者点击采纳时使用浏览器 `confirm()`；
- 确认文案脱离页面上下文；
- 不利于说明“采纳不等于绕过老师审核”的业务边界。

修复后：

- 新增 `acceptingAnswerId` 状态；
- 首次点击【采纳这个讲解】只展开页面内二次确认区域；
- 二次确认区域明确提示：采纳会记录私密讲解成长能量，老师审核仍是公开展示前置条件；
- 提供【确认采纳这个讲解】和【取消】两个真实按钮；
- 不再使用浏览器 `confirm()`。

---

## 3. 新增规则测试

新增文件：

`tests/stage1f-notice-feedback-rules.test.mjs`

覆盖内容：

1. `app/login/page.tsx`、`app/teacher/page.tsx`、`app/qa/question/[id]/page.tsx` 不允许出现 `alert()` / `confirm()` / `prompt()`；
2. 登录注册成功必须用页面内 notice；
3. 老师工作台必须有统一 notice helper 与 `role="status"`；
4. 问题详情采纳必须使用页面内二次确认，而不是浏览器 confirm。

TDD 红灯记录：旧代码运行该测试时 4/4 失败，失败点分别对应注册页 alert、老师工作台 alert、问题详情 confirm 和缺少页面内 notice/二次确认状态。

---

## 4. 本地验证

执行命令：

```bash
node --test tests/stage1f-notice-feedback-rules.test.mjs tests/stage1f-answer-status-consistency-rules.test.mjs tests/qa-flow-rules.test.mjs tests/qa-ui-rules.test.mjs tests/stage1f-outcome-hall-empty-state-rules.test.mjs tests/stage1f-project-pricing-authenticity-rules.test.mjs && npm run build
```

结果：

```text
27/27 通过
npm run build 通过
```

构建结果：

```text
✓ Compiled successfully
✓ Generating static pages (15/15)
```

---

## 5. 部署记录

部署目标：

```text
/var/www/math-young-lecturer
```

PM2 应用：

```text
math-young-lecturer
```

部署注意：

- 本项目 worktree standalone 构建的 `server.js` 位于嵌套目录；
- 部署时已保留生产 `.env`、根 `server.js`、`node_modules/next`；
- 未使用会删除生产根运行时文件的危险 `rsync --delete .next/standalone/` 方式；
- 凭据、私钥路径、环境变量值均已按安全要求省略，不写入本文档。

部署结果：

```text
preserve_ok
deploy_ok
```

---

## 6. 公网验证

### 6.1 页面与缓存

```text
GET /math-young-lecturer/login   200 no-store
GET /math-young-lecturer/teacher 200 no-store
GET /math-young-lecturer/qa      200 no-store
```

### 6.2 线上静态 chunk 检查

关键 chunk 扫描结果：

```text
no_browser_dialog_calls_in_critical_chunks
```

线上 chunk 已包含：

```text
注册成功！请等待老师开放权限后登录
确认采纳这个讲解
已开放基础参与
```

并且关键 chunk 中未发现：

```text
alert(
confirm(
prompt(
```

### 6.3 阶段1-F 核心回归 API

```text
/api/questions?status=OPEN
questions=1
answers_exposed=0
bad_answer_state_count=0

/api/hall
outcomes_count=0
emptyState=REVIEWING_FIRST_BATCH
rankingEnabled=false

/api/projects
projects=1
bad_paid_zero=0
```

### 6.4 PM2 状态

```text
name: math-young-lecturer
status: online
pm_exec_path: /var/www/math-young-lecturer/server.js
pm_cwd: /var/www/math-young-lecturer
unstable_restarts: 0
```

---

## 7. 本轮交付边界

已完成：

- 注册成功 alert 替换为页面内 notice；
- 老师工作台关键操作 alert 替换为统一页面内 notice；
- 问题详情采纳 confirm 替换为页面内二次确认；
- 新增规则测试；
- 相关回归测试与 build；
- 已部署上线并完成公网验证。

尚未完成：

- 全站 `暂未` / `TODO` / `placeholder` 等非弹窗类占位语义清理；
- 用户 `active` 状态按真实运营名单人工复核；
- 阶段1-F 最终总交付文档。

建议下一步：先做 `active` 状态人工复核，避免继续扩大线上账号权限状态的历史副作用；如果运营名单暂未整理好，则进入全站剩余占位/降级文案清理。