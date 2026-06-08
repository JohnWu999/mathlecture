# U0-C｜全站视觉一致性收口交付文档 V1

> 项目：数学小讲师联盟  
> 阶段定位：阶段0-C / U0-C，全站视觉一致性收口  
> 线上地址：http://159.75.144.28/math-young-lecturer  
> 线上提交：`fcd86b0 stage0c: tighten visual consistency across deep routes`  
> 部署包：`/tmp/math-young-lecturer-fcd86b0-u0c-visual-consistency-20260608202629-normalized.tar.gz`  
> SHA256：`3f34d61fb0a6e8ebc4974ab147a85b7287734e876f872ea96a00953ecffebd12`

---

## 一、本阶段的正确定位

U0-C 不是重新设计一套 UI，也不是宣布“全站所有页面高保真完成”。

本阶段目标是：

1. 消除从首页 / 前台分页点击进入详情页、登录页、协作空间、工作台后的明显割裂感。
2. 让内部评审入口、动线、按钮层级时，不再被“新旧 UI 混杂”干扰。
3. 为下一阶段“入口真实性审计 + P0 业务闭环补齐”创造稳定评审环境。

本阶段严格不改业务逻辑、不新增业务闭环、不美化假入口。

---

## 二、本轮实际补救范围

### 1. 登录页 `/login`

已从旧的居中贴纸登录框，补入：

- `forest-page-shell`
- `forest-page-content`
- `forest-page-hero`
- `forest-login-card`
- 全站统一导航 `Navbar`
- 内部测试版身份入口说明

结果：登录入口不再像独立旧页面，而是纳入“数学森林”系统。

### 2. 问题详情页 `/qa/question/[id]`

已补入：

- `forest-page-shell`
- `forest-page-content-narrow`
- `forest-detail-hero`
- `forest-panel` / `forest-card`

保留原有认领、加热度、提交讲题视频、采纳讲解等业务逻辑。

### 3. 项目详情页 `/projects/[id]`

已补入：

- `forest-page-shell`
- `forest-page-content`
- `forest-detail-hero`
- `forest-panel` / `forest-card`

保留原有报名意向、企业微信提示、管理员跟进相关逻辑。

### 4. 项目协作空间 `/groups/[id]`

已补入：

- `forest-page-shell`
- `forest-page-content`
- `forest-detail-hero`
- `forest-card`

保留原有小组留言、作品附件、过程记录、任务卡逻辑。

### 5. 成果详情页 `/hall/[id]`

已补入：

- `forest-page-shell`
- `forest-page-content`
- `forest-detail-hero`
- `forest-empty`

当前成果广场 API 暂无可公开成果样本，因此线上详情页只能做代码与路由级验证；后续有公开成果后需补一次人工视觉验收。

### 6. 老师工作台 `/teacher`

已从“旧儿童便利贴风后台”收口为更克制的：

- `forest-page-shell`
- `guardian-workbench-shell`
- `guardian-workbench-hero`
- `guardian-panel`
- `guardian-card`
- 明确文案：守林人工作台｜老师

后台仍保持专业、清晰、可操作，不童趣化。

### 7. 管理员工作台 `/admin`

已补入：

- `forest-page-shell`
- `guardian-workbench-shell`
- `guardian-workbench-hero`
- `guardian-panel`
- `guardian-card`
- 明确文案：守林人工作台｜管理员

保留项目包、报名意向、企业微信配置、数据库工作台、审计等原业务逻辑。

---

## 三、新增视觉一致性测试

新增测试文件：

`tests/u0c-visual-consistency-rules.test.mjs`

覆盖规则：

1. 深层路由必须使用统一森林壳层、内容容器、详情 hero、卡片/面板/空状态。
2. 老师/管理员后台必须使用克制的守林人工作台壳层，而不是继续只用儿童便利贴旧风格。
3. 全局 CSS 必须定义 U0-C 详情页和工作台视觉 token。

测试结果：3/3 通过。

---

## 四、本地验证结果

已通过：

- `tests/u0c-visual-consistency-rules.test.mjs`：3/3
- `tests/stage0b-forest-ui-rules.test.mjs`：3/3
- `test:growth-energy`：4/4
- `test:qa-flow`：4/4
- `test:qa-ui`：4/4
- `test:growth-passport-ui`：4/4
- `test:project-camp-ui`：5/5
- `test:project-collab-ui`：5/5
- `test:outcome-hall-ui`：5/5
- `test:review-authorization`：5/5
- 路径/登录/授权相关测试：12/12
- `npm run build`：通过

---

## 五、线上部署与验证

线上部署路径：

`/var/www/math-young-lecturer.releases/fcd86b0-u0c-20260608202629`

线上 PM2：

- 应用：`math-young-lecturer`
- 状态：online
- unstable restarts：0

线上关键路径验证：

| 路径 | 结果 | 说明 |
|---|---:|---|
| `/` | 200 | 首页可访问；精确 base URL 无重复 basePath |
| `/login` | 200 | 含 `forest-page-shell` 与 `forest-page-hero` |
| `/qa` | 200 | 含森林壳层与 hero |
| `/qa/ask` | 200 | 含森林壳层与 hero |
| `/projects` | 200 | 含森林壳层与 hero |
| `/hall` | 200 | 含森林壳层与 hero |
| `/profile` | 307 | 未登录正常跳转 `/math-young-lecturer/login` |
| `/teacher` | 307 | 未登录正常跳转 `/math-young-lecturer/login` |
| `/admin` | 307 | 未登录正常跳转 `/math-young-lecturer/login` |
| `/projects/[id]` | 200 | 示例项目详情页可访问，含森林壳层 |
| `/qa/question/[id]` | 200 | 示例问题详情页可访问，含森林壳层 |
| `/api/hall` | 200 | API 正常 |
| `/api/projects` | 200 | API 正常 |
| `/api/questions?status=OPEN` | 200 | API 正常 |
| `/api/teacher/outcomes` | 401 | 未登录受保护接口正常返回 401 |

说明：浏览器自动化工具本轮因环境 Chrome sandbox 限制无法启动，未完成自动截图验收；已通过代码规则测试、构建、线上 HTTP 与 API 验证。后续仍建议人工打开关键页面做一轮视觉走查。

---

## 六、仍然保留的边界

U0-C 完成后，可以说：

- 首页、前台分页、登录页、详情页、项目协作空间、老师/管理员工作台的视觉割裂感已经做了收口。
- 后台采用“守林人工作台”克制专业壳层，不再直接沿用儿童化页面感。
- 内部评审入口、动线、按钮层级的视觉基础已经更稳定。

但不能说：

- 全站所有页面已经高保真完成。
- 所有按钮已经真实可运行。
- 所有业务闭环已经完成。

尤其是：

- 成果详情页当前缺少公开成果样本，后续需补视觉抽检。
- 老师/管理员后台只是壳层收口，内部每个表格/表单的精细视觉还可以继续优化，但不建议再卡住阶段1。
- 假入口/半闭环问题本轮没有解决，应进入阶段1处理。

---

## 七、建议下一步

建议正式进入：

**阶段1｜全站入口真实性审计 + P0 真实业务闭环补齐**

优先审计并分类这些动作：

- 上传
- 提交
- 报名
- 认领
- 审核
- 公开
- 撤回
- 开通
- 跟进
- 加入项目
- 查看详情
- 联系老师
- 提交作品

每个入口必须判断：

1. 是否只是页面跳转 / tab 切换 / 弹窗；
2. 是否真实写数据库；
3. 后台是否能追踪；
4. 用户是否能看到状态变化；
5. 如果暂时不能真实闭环，是否应该改文案、弱化、隐藏或标注开发中。
