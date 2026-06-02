# 数学小讲师联盟代码与设计 Review / 优化重构建议

日期：2026-05-25
仓库：JohnWu999/mathlecture
本地路径：/home/ubuntu/Workspace/math-young-lecturer
当前 HEAD：413047d style(homepage): 微调首页视觉效果

## 1. 执行摘要

项目已经具备完整 MVP 骨架：Next.js 14 App Router、NextAuth 手机号密码登录、Prisma/PostgreSQL、学生问答、讲题认领、视频提交、老师审核、项目营、成果广场、个人中心与老师工作台。当前最大的机会不是“补功能”，而是把它从“可运行的页面集合”升级成一个孩子愿意反复回来、家长看得懂、老师管得住的产品。

建议下一阶段目标：

1. 先把工程安全底座补齐：TypeScript 类型、ESLint、依赖漏洞、真实权限校验、输入校验、事务一致性。
2. 再把视觉系统从“到处写 inline style 的手绘效果”升级成“统一 Design System + 可复用组件”。
3. 重构核心使用路径：提问 -> 认领 -> 上传讲解 -> 审核 -> 采纳 -> 成长反馈。
4. 用游戏化和数学探索感提升有趣度：任务、徽章、成长树、讲题地图、项目营故事线、同伴反馈。
5. 用老师工作台提升可管理性：审核队列、权限批量处理、风险提示、学习数据、内容质量标注。

## 2. 当前项目状态

### 2.1 技术栈

- Next.js 14.2.35 + React 18.3.1 + TypeScript
- Tailwind CSS 3.4
- Prisma 5 + PostgreSQL
- NextAuth 4 手机号密码登录
- bcryptjs 密码加密
- basePath：/math-young-lecturer
- standalone 输出部署

### 2.2 规模概览

排除 node_modules、.next、.git、backup 后：

- TSX：约 2957 行
- TS：约 1138 行
- CSS：约 956 行
- Prisma schema：228 行
- 最大文件：
  - app/globals.css：956 行
  - app/page.tsx：首页 644 行
  - components/navbar.tsx：303 行
  - app/teacher/page.tsx：328 行
  - app/qa/question/[id]/page.tsx：274 行

### 2.3 验证结果

- `npm install` 成功。
- `npm run build` 成功，但因为 next.config.js 中 `typescript.ignoreBuildErrors = true`，构建绕过了类型错误。
- `npm run lint` 未真正配置，会进入 Next.js ESLint 初始化交互并失败。
- `npx tsc --noEmit` 失败，核心是 NextAuth 类型扩展与 `NextAuthOptions` 导入/模块声明问题，并且 backup 目录也被 tsconfig include 进来了。
- `npm audit` 显示 4 个漏洞：3 moderate、1 high，主要来自 Next.js 14.2.35、next-auth 4.24.14 及传递依赖。

## 3. 必须优先修复的问题

### P0-1：TypeScript 目前不是可信的质量门

问题：

- `next.config.js` 第 6-8 行启用了 `typescript.ignoreBuildErrors: true`。
- `npx tsc --noEmit` 有大量错误。
- `types/next-auth.d.ts` 的 module augmentation 写法可能覆盖了 next-auth 原始导出，导致 `NextAuthOptions` 被认为不存在。
- `backup-原代码-20260522` 被 tsconfig include，导致备份代码一起参与类型检查。

建议：

1. 修复 `types/next-auth.d.ts`：导入 `DefaultSession` 并扩展，而不是裸 declare 覆盖。
2. `tsconfig.json` exclude 增加：`backup-*`, `.next`, `node_modules`, `tsconfig.tsbuildinfo`。
3. 修复 `app/api/auth/[...nextauth]/route.ts` 中 NextAuth 导入类型问题。
4. 移除 `ignoreBuildErrors`，让 CI/构建真正阻止错误进入生产。

### P0-2：注册接口存在提权风险

文件：`app/api/register/route.ts`

问题：第 7 行接收 `role`，第 42 行直接写入 `role: role || "STUDENT"`，第 45 行如果传入 TEACHER/ADMIN 就会默认开放权限。这意味着公开注册接口理论上可以提交 `{ role: "ADMIN" }` 或 `{ role: "TEACHER" }`。

建议：

- 公开注册永远强制 `role: "STUDENT"`，忽略客户端 role。
- 老师/管理员创建必须走后台受保护接口，并记录操作者。
- 增加服务端 Zod 校验，不信任客户端字段。

### P0-3：中间件 session 检查不可靠

文件：`lib/api-guard.ts`, `middleware.ts`

问题：

- 只检查 `next-auth.session-token`，没有检查 `__Secure-next-auth.session-token`，生产 HTTPS 下可能失效。
- 只判断 cookie 存在，不验证 JWT/数据库 session。
- 权限控制主要依赖 API 内部 `getServerSession`，中间件只是“门槛”，容易造成误解。

建议：

- 保留 API 内部权限校验为主。
- 中间件只做 rate limit / 安全头，不做假 session 判断；或使用 NextAuth 官方 middleware/token 校验。
- 增加安全响应头：CSP、X-Frame-Options/Frame-Ancestors、Referrer-Policy、Permissions-Policy。

### P0-4：接口缺输入校验与业务状态机

典型位置：

- `app/api/questions/route.ts`：title/content/grade/topic 未校验长度、枚举、空白。
- `app/api/answers/route.ts`：videoUrl 未限制来源、格式、长度。
- `app/api/teacher/answers/[id]/review/route.ts`：action 只用 if/else，非 approve 均变 reject。
- `app/api/questions/[id]/claim/route.ts` 与审核/采纳流程需要事务和状态检查。

建议：

- 引入 `zod`，为所有 POST API 建 schema。
- 所有状态流转使用显式有限状态机：OPEN -> CLAIMED -> ANSWERED/PENDING_REVIEW -> APPROVED -> RESOLVED。
- 关键多表操作用 Prisma `$transaction`。
- 积分发放必须幂等：避免重复审核/重复采纳反复加分。

### P0-5：依赖安全漏洞

`npm audit`：Next.js 14.2.35 有多个 DoS / cache poisoning / SSRF 类 advisories，建议升级。

建议：

- 短期：升级 Next.js 到当前 14.x/15.x 可兼容安全版本，验证 basePath + standalone 部署。
- 中期：评估 NextAuth 迁移 Auth.js v5 或锁定明确 patched 方案。
- 加 CI：`npm audit --audit-level=high`。

## 4. 设计与美感 Review

### 4.1 当前优点

- “手绘 / 方格纸 / 便利贴 / 蜡笔色”方向是对的，适合小学一二年级数学互助社区。
- 首页已经尝试从“角色进阶”表达产品价值：提问者 -> 小讲师 -> 项目官。
- 有明显家长信任点：内容审核、时间灵活、真实同伴。
- 视觉资产轻量，基本不用大型图片，性能上有优势。

### 4.2 当前问题

1. 手绘风格被重复实现，视觉不够系统化。很多样式写在 inline style、CSS 变量、Tailwind class 中混杂，后续很难统一调整。
2. 首页 644 行，SVG、数据、交互、样式混在一个文件中，可维护性差。
3. 首页首屏情绪还不够强：没有一个“孩子为什么想讲题”的生动画面，也没有展示真实成果/视频/徽章的第一屏证据。
4. 色彩偏淡、对比度偏低，容易“温柔但不抓人”。需要更有记忆点的主视觉，例如“数学探险地图 / 讲题舞台 / 成长树”。
5. 交互趣味不足：目前主要是点击展开说明，缺少任务感、反馈感、即时成就感。
6. 页面之间体验割裂：问答、项目营、成果广场、个人中心都像列表页，缺少统一的产品叙事。
7. `SecurityGuard` 禁止右键和选择，会伤害可用性与无障碍，对家长/老师复制问题文本、孩子选中文字也不友好。
8. 移动端 Navbar 有重复汉堡按钮结构，可能造成两个菜单按钮同时出现。

## 5. 视觉升级方向：从“手绘页面”到“数学探险乐园”

建议把当前设计升级为：

> 方格纸 + 蜡笔手绘 + 数学探险地图 + 小讲师舞台

核心视觉隐喻：

- 问题是“关卡”。
- 讲题是“上台”。
- 审核是“老师盖章”。
- 采纳是“点亮徽章”。
- 项目营是“组队探险”。
- 成果广场是“作品展览墙”。
- 个人中心是“成长护照”。

### 5.1 首页重构建议

首屏应包含：

- 一个更强的 Hero：
  - 标题：会做题，还要会讲题
  - 副标题：把一道题讲清楚，就是孩子真正理解数学的开始
  - 主按钮：我要提问 / 我要讲题
  - 右侧主视觉：方格纸上的“讲题舞台”：一个孩子拿麦克风讲题，旁边有题卡、徽章、老师印章。
- 三步路径：
  1. 拍下问题
  2. 小讲师认领讲解
  3. 老师审核，采纳加分
- 真实成果预览：展示 3 张讲题卡片，而不是只讲概念。
- 家长信任区：审核机制、安全边界、老师可控、孩子互助不是刷题。
- 项目营入口：5 天小项目地图。

### 5.2 色彩系统建议

保留纸张底色，但增加层次：

- Paper：#FFFDF4 / #FAF7EC
- Ink：#2F241D
- Pencil：#6D5B4A
- Crayon Yellow：#FFD966
- Crayon Green：#8ED081
- Crayon Blue：#7EC8E3
- Coral Accent：#FF8A65
- Purple Fun：#B39DDB

当前颜色多为浅黄/浅绿/浅蓝，儿童感有了，但“舞台感”和“行动感”不足。建议用 Coral 或 Purple 作为高能 CTA 色，但克制使用。

### 5.3 字体与排版建议

- 标题：ZCOOL KuaiLe 只用于品牌/短标题，不要大面积使用。
- 正文：Noto Sans SC / system，保证可读。
- 数字积分/徽章：可用圆润数字样式，增强游戏感。
- 建立 `Text`/`Heading` 规范：H1/H2/H3/body/caption/token，而不是每个页面单独 text-[13px]。

### 5.4 组件化设计系统

建议抽出：

- `components/ui/HandCard.tsx`
- `components/ui/HandButton.tsx`
- `components/ui/Badge.tsx`
- `components/ui/PageHeader.tsx`
- `components/ui/EmptyState.tsx`
- `components/ui/LoadingState.tsx`
- `components/ui/Toast.tsx`
- `components/ui/MathDoodle.tsx`
- `components/feature/QuestionCard.tsx`
- `components/feature/AnswerVideoCard.tsx`
- `components/feature/ProjectCard.tsx`
- `components/feature/GrowthPassport.tsx`

并把手绘边框、蜡笔纹理、按钮状态统一放进 CSS module 或 Tailwind component layer。

## 6. 可用度优化

### 6.1 全局体验

- 所有 `alert()` 改为 toast / inline feedback。
- 所有 fetch 增加错误状态、空状态、重试按钮。
- 登录态加载中不要闪烁“无权访问”。
- 表单提交后按钮显示具体状态：提交中、上传中、等待老师审核。
- 所有用户输入限制长度并显示字数，例如题目 5-80 字，内容 10-1000 字。
- 移动端优先：底部 Tab/快捷入口比顶部汉堡更适合孩子。

### 6.2 提问流程

当前提问是普通表单。建议改为“拍题卡”：

1. 选择年级/主题。
2. 上传题目照片或输入题目。
3. 说一句“我卡在哪里”。
4. 选择是否匿名。
5. 发布后生成“问题卡”，提示：已有几个小讲师可能会认领。

### 6.3 讲题流程

建议加入讲题模板：

- 我先读题。
- 我找到关键词。
- 我画图/列式。
- 我检查答案。
- 我给同学一个小提醒。

页面上可以给孩子一个“讲题脚手架”，不只是让他填 videoUrl。

### 6.4 审核流程

老师审核不应只有通过/拒绝：

- 数学正确性：正确 / 小错误 / 需重讲
- 表达清楚度：清楚 / 一般 / 不清楚
- 语言安全：通过 / 需处理
- 老师小贴士：给孩子鼓励+改进建议

### 6.5 成果广场

建议从列表升级为“展览墙”：

- 今日优秀讲题
- 最会画图的小讲师
- 最清楚表达奖
- 最会提问奖
- 项目营作品展

## 7. 有趣度升级

### 7.1 成长树 / 成长护照

当前首页已有植物隐喻，可以系统化：

- 提 1 个好问题：种下一颗种子。
- 讲 1 道题：长出一片叶子。
- 被采纳：开花。
- 完成项目营：结果子。

个人中心改为“我的数学成长护照”：

- 我的等级：提问者 / 小讲师 / 小导师 / 项目官
- 我的徽章墙
- 我的讲题地图
- 我的项目作品
- 老师给我的一句话

### 7.2 任务系统

- 新手任务：上传头像、提出第一个问题、认领第一道题。
- 每周任务：讲清楚 1 道应用题、帮 1 个同学、完成 1 次项目讨论。
- 项目营任务：Day 1 观察、Day 2 测量、Day 3 建模、Day 4 表达、Day 5 展示。

### 7.3 同伴反馈

不要做成人化评论区，改成安全的结构化反馈：

- “我听懂了！”
- “这一步讲得清楚。”
- “我还想问……”
- “老师提醒：……”

### 7.4 数学内容趣味化

- 题目卡片按主题分类：计算小怪兽、图形侦探、应用题探案、规律发现。
- 项目营用故事线：超市价格侦探、校园测量师、时间规划师、几何建筑师。

## 8. 架构重构建议

### 8.1 目录重构

建议：

```text
app/
  (public)/
    page.tsx
    hall/page.tsx
  (auth)/
    login/page.tsx
  (student)/
    qa/page.tsx
    qa/ask/page.tsx
    qa/question/[id]/page.tsx
    profile/page.tsx
  (teacher)/
    teacher/page.tsx
  api/
components/
  ui/
  layout/
  feature/
lib/
  auth/
  db/
  validations/
  permissions/
  constants/
  api-client/
prisma/
docs/
```

### 8.2 API 重构

- `lib/permissions.ts`：统一 `requireUser`, `requireTeacher`, `requireAdmin`。
- `lib/validations/*.ts`：Zod schema。
- `lib/services/*.ts`：业务逻辑，例如 `questionService.claimQuestion()`。
- API route 只做：鉴权 -> 校验 -> 调 service -> 返回。

### 8.3 数据模型增强

建议新增/调整：

- Answer：增加 `reviewedAt`, `reviewedById`, `teacherTip`, `clarityScore`, `mathScore`, `safetyStatus`。
- Question：增加 `claimedById` 或明确 active answer，避免一个问题多个 pending answer 造成状态混乱。
- PointTransaction：增加 `sourceType`, `sourceId`，确保积分可追溯和幂等。
- Badge：增加 `code`, `criteria`, `level`。
- User：增加 `displayName` 与孩子/家长角色边界。

### 8.4 前端数据获取

当前大量客户端 `fetch('/math-young-lecturer/api/...')`。建议：

- 建一个 `lib/api-client.ts`，统一 basePath、错误处理、类型。
- 可逐步引入 SWR/TanStack Query，处理 loading/error/retry/cache。
- 公开列表页可转为 Server Component，提高首屏体验。

## 9. 分阶段执行计划

### Phase A：工程安全底座（1-2 天）

目标：让项目可持续开发。

- 修复 TypeScript/NextAuth 类型。
- 移除 backup 目录或移出 TS include。
- 配置 ESLint + Prettier。
- 移除 `ignoreBuildErrors`。
- 修复注册提权风险。
- API 增加 Zod 基础校验。
- 关键操作加 Prisma transaction。
- 升级 Next.js 安全版本。

验收：

- `npm run build` 无忽略类型错误。
- `npx tsc --noEmit` 通过。
- `npm run lint` 非交互通过。
- `npm audit --audit-level=high` 通过或有明确例外说明。

### Phase B：Design System 抽离（2-3 天）

目标：让美感可控、可迭代。

- 建立 `design-tokens.css`。
- 抽 `HandCard/HandButton/Badge/PageHeader/EmptyState/Toast`。
- 首页组件拆分为 Hero、JourneyMap、TrustSection、CTASection。
- 删除多数 inline style。
- 修复 Navbar 重复移动端按钮。
- 移除或弱化 SecurityGuard 的禁右键/禁选择。

验收：

- 首页文件降到 200 行以内。
- 全局 CSS 降到 400-500 行以内，剩余为 token + component classes。
- 常用卡片/按钮全站一致。

### Phase C：首页大改版（2-4 天）

目标：大幅提升美感和转化。

- 新 Hero：会做题，还要会讲题。
- 新主视觉：数学讲题舞台 / 成长树 / 探险地图。
- 三步流程动画/卡片。
- 真实成果预览。
- 家长信任模块重写。
- CTA 清晰分流：我要提问、我要讲题、家长了解、老师进入。

验收：

- 手机端首屏 5 秒内能看懂“这是干什么的”。
- 家长能在 30 秒内理解安全机制。
- 孩子能看到“我可以得到徽章/成长”的动机。

### Phase D：核心流程体验升级（4-7 天）

目标：提高可用度。

- 提问向导。
- 讲题脚手架。
- 视频上传/链接校验。
- 审核工作台升级。
- 成果广场展览墙。
- 个人中心成长护照。

### Phase E：有趣度与运营系统（1-2 周）

目标：让孩子愿意持续回来。

- 成长树/徽章/任务系统。
- 每周挑战。
- 项目营 Day 1-5 故事线。
- 安全同伴反馈。
- 老师推荐/精选机制。

## 10. 推荐下一步

我建议下一步不要直接堆新页面，而是先做一个“安全底座 + 首页设计系统重构”的 PR：

1. 修复 P0 安全与类型问题。
2. 抽出设计系统组件。
3. 首页改成高质感第一版。
4. 保持现有业务数据结构尽量不大动，避免范围失控。

完成这个 PR 后，再进入“提问/讲题/审核流程”的产品级重构。
