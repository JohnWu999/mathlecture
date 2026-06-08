# 阶段0-B｜全站分页 UI 视觉统一补救交付文档 V1

> 项目：数学小讲师联盟  
> 目标：在首页高保真森林 UI 与全站导航统一之后，把前台主要分页主体从旧 UI 结构补齐到“无限生长的数学森林”视觉系统。  
> 线上地址：http://159.75.144.28/math-young-lecturer  
> 当前线上提交：`c7b4048 stage0b: unify front pages with forest UI`

---

## 1. 本次补救的准确范围

本次补救不是业务闭环补齐，也不是老师/管理员后台重做；它解决的是前台分页主体 UI 仍停留在旧结构的问题。

已纳入本次阶段0-B的页面：

1. `/qa` 你问我答
2. `/qa/ask` 我要提问
3. `/projects` 项目营
4. `/hall` 成果广场
5. `/profile` 个人中心 / 成长护照

未纳入本次阶段0-B的范围：

1. `/login` 登录页仍保持独立登录页壳层；
2. `/teacher` 老师工作台主体未做“守林人工作台”视觉统一；
3. `/admin` 管理后台主体未重做；
4. 项目详情、问题详情、小组协作空间、成果详情等深层页面未作为本轮重点；
5. 假入口/半闭环的业务能力补齐仍属于后续阶段1入口真实性审计与 P0 真实业务闭环补齐。

---

## 2. 本次补救做了什么

### 2.1 新增全站分页森林视觉壳层

在 `app/globals.css` 中新增阶段0-B视觉样式：

- `forest-page-shell`：全页森林背景、纸张底色、数学符号氛围；
- `forest-page-content` / `forest-page-content-narrow`：统一内容宽度与响应式边距；
- `forest-page-hero`：分页首屏标题区，高对比、圆角、手绘边框、∞ 弱装饰；
- `forest-panel`：页面主信息面板；
- `forest-card`：卡片内容；
- `forest-empty`：空状态；
- `forest-mission-card`：任务/说明类小卡；
- `forest-card-grid`：统一网格；
- `forest-tabs`、`forest-status-pill` 等辅助样式。

### 2.2 前台分页主体视觉统一

- `/qa`：从旧列表页升级为“问题种子 → 讲解长高”的森林页壳，问题卡与温暖提示使用统一森林面板。
- `/qa/ask`：提交问题页升级为“问题种子站”，保留真实提交/上传/审核逻辑，同时让步骤卡、表单主体进入森林视觉系统。
- `/projects`：项目营升级为“森林任务”视觉表达，项目卡、准备度说明、空状态统一为森林卡片。
- `/hall`：成果广场升级为“森林展墙”，成果筛选、说明卡、成果卡进入统一森林视觉系统。
- `/profile`：个人中心升级为更高保真的“成长护照”，强调私密成长、不排名、三棵成长小树与成长能量记录。

### 2.3 新增阶段0-B视觉规则测试

新增测试：

- `tests/stage0b-forest-ui-rules.test.mjs`

测试约束：

1. 前台主要分页必须使用 `forest-page-shell` 与 `forest-page-hero`；
2. 全局 CSS 必须定义壳层、hero、卡片、任务面板、空状态等视觉 token；
3. 页面文案必须保留已确认的森林隐喻：问题种子、森林任务、森林展墙、成长护照、不排名。

---

## 3. 验证结果

### 3.1 本地验证

已通过：

- `node --test tests/stage0b-forest-ui-rules.test.mjs`：3/3 通过；
- `npm run test:growth-energy`：4/4 通过；
- `npm run test:qa-flow`：4/4 通过；
- `npm run test:qa-ui`：4/4 通过；
- `npm run test:growth-passport-ui`：4/4 通过；
- `npm run test:project-camp-ui`：5/5 通过；
- `npm run test:project-collab-ui`：5/5 通过；
- `npm run test:outcome-hall-ui`：5/5 通过；
- `npm run test:review-authorization`：5/5 通过；
- 路径/权限相关 node tests：12/12 通过；
- `npm run build`：通过。

### 3.2 线上部署验证

线上版本：`c7b4048 stage0b: unify front pages with forest UI`

公网路径验证：

- `/qa`：200，包含 `forest-site-nav`、`forest-page-shell`、`forest-page-hero`、`forest-panel`、`问题种子`；
- `/qa/ask`：200，包含 `forest-site-nav`、`forest-page-shell`、`forest-page-hero`、`forest-panel`、`forest-card`、`问题种子`；
- `/projects`：200，包含 `forest-site-nav`、`forest-page-shell`、`forest-page-hero`、`forest-panel`、`森林任务`、`成长护照`；
- `/hall`：200，包含 `forest-site-nav`、`forest-page-shell`、`forest-page-hero`、`forest-panel`、`forest-card`、`森林展墙`；
- `/profile`：未登录时 307 跳转 `/math-young-lecturer/login`，符合权限边界；页面源码已纳入 `forest-page-shell` / `forest-page-hero`；
- `/api/hall`：200；
- `/api/projects`：200；
- `/api/questions?status=OPEN`：200。

PM2 状态：`math-young-lecturer` online，unstable restarts 为 0；日志复查未见新错误。

部署包：`/tmp/math-young-lecturer-c7b4048-stage0b-forest-ui-20260608193126-normalized.tar.gz`  
部署包 sha256：`bd5161398598179fe74422270bc286029da77ee1fd4be7048f51c65ef0730293`

---

## 4. 仍需诚实保留的边界

1. 本轮已经完成“前台主要分页主体 UI 统一补救”，但不等于全站所有页面视觉都完成。
2. 登录页仍是独立样式。
3. 老师工作台、管理员后台还没有做“守林人工作台”视觉统一。
4. 项目详情、问题详情、协作空间、成果详情等深层页面仍需后续分批纳入。
5. 真实业务闭环问题仍未在本轮解决；假入口/半闭环仍需要专门做入口真实性审计。

---

## 5. 下一步建议

建议下一步进入：

**阶段1｜全站入口真实性审计 + P0真实闭环补齐**

优先审计：

1. 每个按钮是否真实可点击；
2. 点击后是否真实写数据库；
3. 后台是否可追踪；
4. 用户是否能看到状态变化；
5. 做不到的入口是否标注“开发中 / 当前仅支持链接提交 / 即将开放”，或弱化/隐藏。

如果继续视觉补救，则下一轮建议做：

1. 项目详情页；
2. 问题详情页；
3. 小组协作空间；
4. 成果详情页；
5. 登录页；
6. 老师工作台 / 管理员后台的专业版“守林人工作台”。
