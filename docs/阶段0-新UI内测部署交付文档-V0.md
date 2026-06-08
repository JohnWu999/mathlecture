# 阶段0｜新 UI 内测部署交付文档 V0

项目：数学小讲师联盟  
阶段：阶段0｜新 UI 内测部署  
状态：已部署到线上内测站  
线上地址：http://159.75.144.28/math-young-lecturer  

---

## 1. 本阶段目标

阶段0不是继续扩展功能，也不是宣布产品正式上线，而是把此前最终确认的 UI 设计方案先部署到内部测试站，用来帮助团队判断：

1. 首页第一眼是否符合“无限生长的数学森林”方向；
2. 主要入口是否清楚；
3. 哪些按钮是真实闭环，哪些只是占位或半闭环；
4. 登录、身份、路径、后台入口是否能够作为后续真实业务闭环的地基。

---

## 2. 采用的最终 UI 方案

本次执行采用此前最终讨论确认的方案：

- 全站视觉方向：无限生长的数学森林；
- 首页高保真方向：V1｜灵动生命力版；
- 核心主标题：让一个好问题，长成一片数学森林；
- 核心 CTA：我要提问 / 看孩子如何成长；
- 成长动线：问题发芽 / 讲解长高 / 项目成林；
- 视觉原则：有生命的数学感、低焦虑、儿童友好、家长可信、不做排行榜刺激。

参考文档：

- `docs/全站UI视觉风格指南-V2-无限生长版.md`
- `docs/首页高保真视觉稿-V1-说明.md`
- `docs/首页高保真视觉稿-V1-灵动生命力版.html`

---

## 3. 本次实际完成

### 3.1 首页首屏升级

已把首页从“项目名称 + 身份路径”调整为更接近最终高保真方案的首屏：

- 增加副标签：小学1–3年级数学共学社区 · 会思考，爱数学；
- 使用主标题：让一个好问题，长成一片数学森林；
- 使用副标题：孩子提问，孩子讲解，孩子一起把数学用起来；
- 保留提问者 / 小讲师 / 探索家的成长路径；
- CTA 调整为：我要提问 / 看孩子如何成长。

### 3.2 增加内部测试提示

首页顶部新增明确提示：

> 内部测试版｜功能入口正在验收

目的：避免团队把漂亮页面误判为正式完成。当前版本用于检查入口、按钮、身份路径、后台追踪和真实闭环。

### 3.3 修复重复 basePath 跳转问题

部署验证时发现未登录访问老师/个人中心仍会跳转到：

`/math-young-lecturer/math-young-lecturer/login`

已修复为：

`/math-young-lecturer/login`

这属于阶段0必须先处理的地基问题，否则后续入口真实性审计会被登录路径问题干扰。

---

## 4. 本次代码提交

- `6d2f8f9 stage0: deploy internal test UI`
- `c79fd32 fix: avoid duplicate basePath redirects`

部署包：

- `/tmp/math-young-lecturer-c79fd32-stage0-ui-20260608184427-normalized.tar.gz`
- sha256：`5016f6863ba9bfa1945e5d13fca8414480e3cb295d7fd11ca7a7041d0851ccd3`

线上备份：

- `/var/backups/math-young-lecturer/math-young-lecturer-before-stage0-ui-c79fd32-20260608-184455.tar.gz`

线上 release：

- `/var/www/math-young-lecturer-releases/stage0-ui-c79fd32-20260608-184455`

---

## 5. 验证结果

### 5.1 本地构建

`npm run build` 通过。

### 5.2 自动规则测试

以下测试已通过：

- `test:growth-energy`：4/4
- `test:qa-flow`：4/4
- `test:qa-ui`：4/4
- `test:growth-passport-ui`：4/4
- `test:project-camp-ui`：5/5
- `test:project-collab-ui`：5/5
- `test:outcome-hall-ui`：5/5
- `test:review-authorization`：5/5
- `legacy-path-redirect-rules + login-redirect-rules`：7/7

### 5.3 线上路径验证

线上地址：

- 首页：200，已出现“内部测试版”和“让一个好问题”；
- 登录页：200；
- 你问我答：200；
- 项目营：200；
- 成果广场：200；
- `/api/hall`：200；
- `/api/projects`：200；
- `/api/questions?status=OPEN`：200；
- 未登录访问老师工作台：307 → `/math-young-lecturer/login`；
- 未登录访问个人中心：307 → `/math-young-lecturer/login`；
- `/api/teacher/outcomes` 未登录：401；
- 页面与跳转中未再检出 `/math-young-lecturer/math-young-lecturer` 重复路径。

PM2 状态：online，unstable restarts 为 0。日志复查未见新错误。

---

## 6. 仍需注意

阶段0已经完成“新 UI 内测部署”和“登录路径地基修复”，但这不代表所有按钮都已经真实可运行。

下一阶段必须进入：

> 全站入口真实性审计

重点把每个按钮分为：

1. 真实可用；
2. 半真实可用；
3. 近期必须补齐；
4. 远期规划，需要隐藏、弱化或标注开发中。

审计字段建议包括：入口名称、页面路径、按钮文案、当前动作、是否写数据库、后台是否可追踪、用户是否看到状态变化、分类、处理建议。
