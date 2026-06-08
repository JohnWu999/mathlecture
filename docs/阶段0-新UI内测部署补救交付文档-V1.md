# 阶段0｜新 UI 内测部署补救交付文档 V1

项目：数学小讲师联盟  
线上地址：http://159.75.144.28/math-young-lecturer  
补救日期：2026-06-08  
当前提交：ad85f75 stage0: realign homepage with high fidelity forest UI

---

## 1. 纠偏结论

前一版阶段0交付判断过于乐观：它完成了工程部署、basePath 跳转修复和局部首页文案调整，但没有真正按《全站 UI 视觉风格指南 V2｜无限生长版》和《首页高保真视觉稿 V1｜灵动生命力版》落地。

本次补救不再沿用旧首页做局部修补，而是重新读取并对照以下源文件，以 V1 高保真 HTML 为视觉母版重构首页：

- `docs/全站UI视觉风格指南-V2-无限生长版.md`
- `docs/首页高保真视觉稿-V1-说明.md`
- `docs/首页高保真视觉稿-V1-灵动生命力版.html`

---

## 2. 本次补救实际改动

改动文件：

- `app/page.tsx`

补救重点：

1. 移除旧首页的阶段卡片式局部结构，改为接近 V1 母版的首页叙事结构。
2. 新增接近 V1 的独立顶部导航视觉壳：Logo ∞ 符号、米白半透明导航、森林色主导航。
3. 首屏改为左右结构：
   - 左侧：主标题“让一个好问题，长成一片数学森林。”、短副文案、两个 CTA；
   - 右侧：完整“一个问题正在长大”的世界卡片。
4. 落地 V1 核心视觉母题：
   - ∞ 生长路径；
   - 发光小点；
   - 问题发芽 / 讲解长高 / 项目成林三节点；
   - 今日问题种子卡；
   - 温暖小纸条“谢谢你把问题说出来”。
5. 首页后续分区按 V1 叙事重建：
   - 一个问题的旅程；
   - 三种成长身份；
   - 项目营森林任务；
   - 成果海报/展墙；
   - 温暖回应小纸条。
6. 保留内部测试提示，但从视觉上降为顶部提示条，不再破坏首页主体视觉。
7. 保留真实入口链接：
   - 我要提问 → `/qa/ask`
   - 你问我答 → `/qa`
   - 项目营 → `/projects`
   - 成果广场 → `/hall`
   - 个人中心 → `/profile`

---

## 3. 验证结果

### 3.1 构建验证

已执行：

```bash
npm run build
```

结果：通过。Next.js 生产构建成功，首页 `/` 被静态生成。

### 3.2 规则测试

已执行：

```bash
npm run test:growth-energy
npm run test:qa-flow
npm run test:qa-ui
npm run test:growth-passport-ui
npm run test:project-camp-ui
npm run test:project-collab-ui
npm run test:outcome-hall-ui
npm run test:review-authorization
node --test tests/legacy-path-redirect-rules.test.mjs tests/login-redirect-rules.test.mjs tests/review-authorization-rules.test.mjs
```

结果：全部通过。

### 3.3 本地页面内容验证

本地生产服务验证首页 HTML 包含以下 V1 关键元素：

- “让一个好问题”
- “长成一片数学森林”
- “内部测试版”
- “问题发芽”
- “讲解长高”
- “项目成林”
- “谢谢你把问题说出来”
- “森林任务”

同时验证页面 HTML 中未出现重复 basePath：`/math-young-lecturer/math-young-lecturer`。

### 3.4 线上验证

线上地址：

- http://159.75.144.28/math-young-lecturer

线上验证结果：

- 首页返回 200；
- 首页 HTML 包含 V1 关键视觉文案：数学森林、问题发芽、讲解长高、项目成林、温暖小纸条、森林任务；
- `/login`、`/qa`、`/projects`、`/hall` 返回 200；
- 未登录访问 `/teacher`、`/profile` 正确 307 跳转到 `/math-young-lecturer/login`；
- `/api/hall`、`/api/projects`、`/api/questions?status=OPEN` 返回 200；
- `/api/teacher/outcomes` 未登录返回 401；
- PM2 `math-young-lecturer` online，unstable restarts 为 0。

### 3.5 浏览器截图说明

当前 Hermes 浏览器工具在本机启动 Chrome 时遇到容器 sandbox 限制，未能生成工具内截图。因此本次补救已完成构建、服务、HTML 内容、路由/API 与 PM2 验证；但仍建议项目组人工打开线上地址做最终肉眼视觉验收，重点对照 V1 PNG：

- `docs/首页高保真视觉稿-V1-灵动生命力版.png`
- `docs/首页高保真视觉稿-V1-灵动生命力版-mobile.png`

---

## 4. 部署信息

部署提交：

- `ad85f75 stage0: realign homepage with high fidelity forest UI`

部署包：

- `/tmp/math-young-lecturer-ad85f75-stage0-ui-v1fix-20260608190553-normalized.tar.gz`

SHA256：

- `51df857b21a3696afb824d983e687da4ff38f6d5556195688005e899c6f5d3fc`

线上 release：

- `/var/www/math-young-lecturer-releases/stage0-ui-v1fix-ad85f75-20260608190553`

备份 release：

- `/var/www/math-young-lecturer-releases/backup-before-stage0-ui-v1fix-20260608190700`

---

## 5. 当前边界

本次补救解决的是：阶段0首页 UI 没有按最终高保真视觉稿落地的问题。

本次补救没有宣称解决全部真实业务闭环。网站仍处于内部测试阶段，下一步必须继续做“入口真实性审计”：所有上传、提交、报名、认领、审核、公开、撤回、开通、跟进类按钮，要么真实写入持久状态并在对应角色后台可追踪，要么降级/隐藏/标注开发中。

---

## 6. 下一步建议

阶段0补救后，应进入阶段1：全站入口真实性审计。

审计表字段建议：

1. 页面；
2. 按钮/入口名称；
3. 当前点击结果；
4. 是否写数据库；
5. 后台是否可追踪；
6. 用户是否看到状态变化；
7. 分类：真实可用 / 半真实 / 假入口 / 远期规划；
8. 处理建议：保留强按钮 / 改文案 / 弱化 / 隐藏 / 立即补齐。
