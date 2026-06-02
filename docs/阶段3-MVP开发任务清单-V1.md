# 阶段3：MVP 开发任务清单 V1

项目：数学小讲师联盟  
当前阶段：阶段3｜MVP 开发任务拆解  
版本：V1  
状态：已吸收犟爸对V0的8项反馈，并经产品第一性原理复核，补齐身份星级、审核标签、成果分享、项目CRUD、角色隔离、知识点标签、公开咨询入口、积分流水规则  
依据：阶段1最终交付文档 V1、阶段2最终交付文档 V2、阶段3页面原型与 MVP 功能拆解 V2、阶段3 UI低保真线框图 V2  
代码仓库：`/home/ubuntu/Workspace/math-young-lecturer`

---

## 一、MVP 开发总原则

### 1.1 产品第一性原理

MVP 开发必须守住以下原则：

1. **孩子是真正主角**：提问、讲题、项目探索、作品沉淀都围绕孩子的真实思考展开。
2. **不把平台做成刷题或排名系统**：不公开排行榜、不公开积分总数、不出现“最高赞”“最火”“超过多少人”等刺激性表达。
3. **提问、讲题、项目探索三条路径并列**：孩子可以先提问，也可以尝试讲题，也可以参加项目，不要求一开始就敢讲题或会合作。
4. **低年级友好**：表单、提示、任务、反馈都要短、清楚、可由家长辅助操作。
5. **老师守安全与正确性，不替代孩子表达**：老师重点负责审核、能力观察标签、项目节点提醒和付费项目反馈，不把孩子讲法打磨成成人标准答案。
6. **MVP 优先可运行闭环**：先做可浏览、可提交、可审核、可发布、可组队、可留言、可提醒的基础闭环；复杂 AI、自动支付、视频合成、实时协作后置。

### 1.2 MVP 范围判断

MVP 必须完成：

- 首页与 5 个主导航：`首页 / 你问我答 / 项目营 / 成果广场 / 个人中心`；
- 登录/注册不作为主导航页面，但保留登录能力；
- 你问我答闭环：提交问题、热度、认领、72小时上传、审核、发布、分享范围；
- 项目营闭环：项目展示、参与条件、所需人数、自动开组、协作空间、成果提交；
- 成果广场：展示已审核、已授权内容；
- 个人中心：资料卡、我的提问、我的讲解、我的项目、成长护照、我的消息、我的影响力；
- 老师工作台：审核问题、审核讲解、审核成果、项目节点管理；
- 管理员后台：用户、项目、权限、报名意向、付费/退费记录、教师权限；
- 站内通知：审核通过/退回、讲解发布、项目留言、组队成功、任务节点变化；
- 类型化封面与分享海报：系统生成站内展示图，不要求剪入视频首帧。

MVP 不做：

- 自动支付与自动退款；
- 短信/微信服务号/邮件等站外通知；
- AI 自动解题、AI 自动生成孩子答案；
- 实时在线协作文档、视频会议、复杂群聊；
- 视频自动合成封面首帧；
- 公开排行榜、公开积分总数、邀请拉新榜。

### 1.3 V0反馈的客观复核结论

| 反馈 | 判断 | 处理方式 |
|---|---|---|
| 三个主要身份星级点亮需要数据规则 | 采纳 | 增加“有效行为 → 身份点亮/星级”的后台规则，避免只写展示不写运转逻辑 |
| 清楚/基本清楚/需补充逻辑不清 | 采纳并修正 | 拆成“审核结论”和“能力观察标签”；推送标准以审核通过为准，质量标签用于成长护照和成果筛选 |
| 成果广场作品希望所有人可转发分享 | 部分采纳 | 成果广场内“已审核+已授权公开”的作品均可转发；非公开分享范围的作品不进入广场、不外传 |
| 老师可编辑、删除、上传项目封面 | 采纳但加保护 | 老师可创建/编辑/上传封面/下架；有参与记录的项目不硬删除，只归档或下架 |
| 学习者、老师、管理员的工作页面严格区分 | 采纳 | 从个人中心统一登录与分流，但前后台路由与API权限严格隔离，不能误入或越权 |
| 内置1–3年级知识点标签 | 采纳 | 增加内置知识点标签表/常量，上传题目时下拉选择 |
| 网站公开老师企业微信 | 采纳但不喧宾夺主 | 首页、页脚、项目营、个人中心咨询入口均可出现；不作为首屏主CTA替代“我要提问/看看孩子怎么学” |
| 积分流水是否能跑通 | 采纳 | 补齐积分原因枚举、流水规则、触发点、反作弊边界和后台统计方式 |

---

## 二、当前代码基础判断

### 2.1 已存在基础

当前仓库是 Next.js 14 App Router + Prisma + NextAuth 项目，已有以下基础：

| 模块 | 已有文件 | 当前作用 |
|---|---|---|
| 首页 | `app/page.tsx` | 已有旧首页，需要按 V2 线框重构 |
| 导航 | `components/navbar.tsx` | 已有导航，但缺“首页”和“个人中心”作为稳定主导航，移动端汉堡存在重复按钮风险 |
| 登录注册 | `app/login/page.tsx`、`app/register/page.tsx`、`app/api/auth/[...nextauth]/route.ts` | 已有账号登录注册基础 |
| 你问我答 | `app/qa/page.tsx`、`app/qa/ask/page.tsx`、`app/qa/question/[id]/page.tsx`、`app/api/questions/*` | 已有问题列表、提交、详情、认领雏形 |
| 项目营 | `app/projects/page.tsx`、`app/projects/[id]/page.tsx`、`app/api/projects/*` | 已有项目展示和报名雏形 |
| 协作空间 | `app/groups/[id]/page.tsx`、`app/api/groups/[id]/messages/route.ts` | 已有小组和留言雏形 |
| 成果广场 | `app/hall/page.tsx`、`app/api/hall/route.ts` | 已有成果展示雏形 |
| 个人中心 | `app/profile/page.tsx`、`app/api/user/profile/route.ts` | 已有个人资料雏形 |
| 老师工作台 | `app/teacher/page.tsx`、`app/api/teacher/*` | 已有老师审核和用户管理雏形 |
| 数据库 | `prisma/schema.prisma` | 已有 User、Question、Answer、Project、Group、Message、PointTransaction、Badge 等模型 |

### 2.2 需要补齐的核心差距

| 差距 | 影响 | 处理方式 |
|---|---|---|
| 主导航与 V2 不一致 | 新用户无法按确认后的信息架构理解平台 | 重构 `components/navbar.tsx` |
| 首页仍是旧的“身份进阶”表达 | 与 V2 首屏和“真实思考”定位不一致 | 重构 `app/page.tsx` |
| 数据库缺热度、认领截止、分享范围、通知、报名意向、付费/退费记录、成果封面、项目任务等字段/表 | 无法支撑 MVP 闭环 | 扩展 Prisma schema |
| 付费报名仍偏“注册/支付”模式 | 与“可选联系方式 + 企业微信二维码 + 后台跟进”不一致 | 新增报名意向与后台跟进状态 |
| 项目组队逻辑不够清晰 | 无法实现满3人自动开组并开启协作空间 | 明确 groupSize、waiting/active 状态与自动开组 API |
| 站内通知缺统一模型 | 审核、留言、组队、发布提醒无法统一展示 | 新增 Notification 表和 API |
| 成果广场缺统一授权与类型化封面机制 | 容易展示未授权内容或封面混乱 | 新增 shareScope、coverType、coverData |
| 老师/管理员边界不够细 | 容易把后台入口暴露给学习者 | 补权限守卫与后台路由分流 |

---

## 三、数据库与数据模型任务

### 3.1 扩展 `User` 学习者资料与身份星级规则

**文件：** `prisma/schema.prisma`

新增或调整字段：

| 字段 | 类型 | 说明 | MVP 规则 |
|---|---|---|---|
| `learnerIntro` | `String?` | 一句话数学介绍 | 个人中心展示 |
| `questionerLevel` | `Int @default(0)` | 提问者星级/点亮深度 | 0为未点亮，1–3为星级，由有效提问行为触发 |
| `lecturerLevel` | `Int @default(0)` | 小讲师星级/点亮深度 | 0为未点亮，1–3为星级，由审核通过讲解触发 |
| `explorerLevel` | `Int @default(0)` | 探索家星级/点亮深度 | 0为未点亮，1–3为星级，由项目参与和成果触发 |
| `inviteCode` | `String? @unique` | 分享海报二维码追踪码 | 只用于影响力统计，不做排行榜 |

新增模型：

```prisma
model IdentityProgress {
  id             String   @id @default(cuid())
  identityType   IdentityType
  effectiveCount Int      @default(0)
  qualityCount   Int      @default(0)
  level          Int      @default(0)
  updatedAt      DateTime @updatedAt
  userId         String
  user           User     @relation(fields: [userId], references: [id])

  @@unique([userId, identityType])
  @@map("identity_progress")
}

enum IdentityType {
  QUESTIONER
  LECTURER
  EXPLORER
}
```

MVP身份星级规则：

| 身份 | 有效行为定义 | 1星/点亮 | 2星 | 3星 | 质量加权 |
|---|---|---|---|---|---|
| 提问者 | 提交真实数学问题且老师审核通过 | 1个有效问题 | 5个有效问题 | 10个有效问题，且至少3个问题被解答或被同学加热度 | 问题被解答、被多人加热、标题/困惑描述清楚，可记为质量行为 |
| 小讲师 | 上传讲解，数学正确、表达达到“基本清楚”及以上，并审核通过 | 1个通过讲解 | 3个通过讲解 | 6个通过讲解，且至少2次获得能力观察标签 | 逻辑清晰、会画图、表达完整、帮助多人理解等标签累计 |
| 探索家 | 参加项目并完成关键任务或成果提交 | 完成1个项目关键任务/基础项目 | 完成3个项目关键任务或1个完整项目 | 完成5个项目关键任务或2个完整项目，且有1次公开/小组成果 | 合作记录、按时提交、成果审核通过、项目反馈完成 |

客观说明：不建议把“提问10道”作为第一颗星门槛。低年级孩子需要先被看见和鼓励，所以1星应代表“开始了真实行为”；10次更适合作为3星深度。

**验收标准：**

- 学习者个人中心能展示头像、昵称、年级、一句话数学介绍；
- 主身份为“提问者 / 小讲师 / 探索家”，未点亮为灰色，点亮后展示 1–3 星；
- 星级来自后台有效行为，不由前端手动写死；
- 不在公开页面展示具体积分总数；
- 星级不是排名，不显示“超过多少人”。

### 3.2 扩展 `Question` 问题模型

**文件：** `prisma/schema.prisma`

新增或调整字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `recognizedText` | `String?` | OCR/系统识别题目文字，MVP 可人工填写 |
| `confusionType` | `String?` | 看不懂题意/不知道先算什么/画图不会画/算式会错/两种想法不确定/其他 |
| `reviewStatus` | `ContentReviewStatus @default(PENDING)` | 问题是否通过老师审核 |
| `heatCount` | `Int @default(0)` | 热度冗余计数，真实记录见 QuestionHeat |
| `claimedById` | `String?` | 当前认领小讲师 |
| `claimedAt` | `DateTime?` | 认领时间 |
| `claimExpiresAt` | `DateTime?` | 72小时截止时间 |
| `releasedAt` | `DateTime?` | 超时或请假释放时间 |

新增枚举：

```prisma
enum ContentReviewStatus {
  PENDING
  APPROVED
  REJECTED
}
```

新增模型：

```prisma
model QuestionHeat {
  id         String   @id @default(cuid())
  createdAt  DateTime @default(now())
  questionId String
  userId     String

  question   Question @relation(fields: [questionId], references: [id])
  user       User     @relation(fields: [userId], references: [id])

  @@unique([questionId, userId])
  @@map("question_heats")
}
```

**验收标准：**

- 同一学习者对同一道题只能加热度一次；
- 热度不是点赞或排名，只影响可认领列表排序；
- 认领后 72 小时倒计时；
- 请假退出或超时后题目释放。

### 3.2.1 内置1–3年级数学知识点标签

**文件：**

- 新增：`lib/knowledge-tags.ts`
- 可选新增模型：`KnowledgeTag`

MVP建议先用代码常量内置，便于快速上线；后续如需运营后台编辑，再迁移为数据库表。

```ts
export const KNOWLEDGE_TAGS = {
  1: [
    "20以内加减法",
    "100以内数的认识",
    "认识图形",
    "分类与比较",
    "认识钟表",
    "人民币初步",
    "找规律",
    "解决问题",
    "其他"
  ],
  2: [
    "100以内加减法",
    "表内乘法",
    "表内除法",
    "长度单位",
    "角的初步认识",
    "观察物体",
    "数据整理",
    "找规律",
    "解决问题",
    "其他"
  ],
  3: [
    "万以内数的认识",
    "两三位数乘一位数",
    "除法初步",
    "年月日",
    "周长",
    "面积初步",
    "分数初步",
    "小数初步",
    "统计与可能性",
    "解决问题",
    "其他"
  ]
} as const;
```

**验收标准：**

- 上传题目时，先选年级，再出现对应知识点下拉；
- 支持“其他”，但选择“其他”时需要家长补充简短说明；
- 老师审核问题时可以补标或修正知识点；
- 知识点用于筛选、推荐讲解、项目匹配，不用于给孩子贴能力强弱标签。

### 3.3 扩展 `Answer` 讲解视频模型

**文件：** `prisma/schema.prisma`

新增或调整字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `shareScope` | `ShareScope @default(RELATED_ONLY)` | 分享给相关同学/成果广场 |
| `coverTitle` | `String?` | 讲题封面标题 |
| `coverKnowledge` | `String?` | 封面知识点 |
| `coverImageUrl` | `String?` | 系统生成站内封面图 |
| `reviewNote` | `String?` | 退回原因/温暖提示 |
| `reviewResult` | `ReviewResult?` | 审核结论：通过/退回修改 |
| `clarityLevel` | `AnswerClarity?` | 表达清晰度观察，不单独决定是否发布 |
| `qualityTags` | `String[]` | 能力观察标签：逻辑清晰、会画图、表达完整、基本清楚、愿意尝试表达等 |
| `approvedAt` | `DateTime?` | 审核通过时间 |

新增枚举：

```prisma
enum ShareScope {
  RELATED_ONLY
  PUBLIC_GALLERY
  PRIVATE_RECORD
}

enum ReviewResult {
  APPROVED
  NEED_REVISION
}

enum AnswerClarity {
  CLEAR
  BASICALLY_CLEAR
  NEEDS_SUPPORT
}
```

审核逻辑：

| 审核项 | 通过标准 | 推送给提问者/加热度同学 | 进入成果广场 |
|---|---|---|---|
| 数学正确性 | 关键思路正确，无明显误导 | 必须满足 | 必须满足 |
| 安全与隐私 | 无真实姓名、学校、联系方式等风险 | 必须满足 | 必须满足 |
| 表达清晰度：清楚 | 逻辑顺、步骤可跟、孩子能看懂 | 可以推送 | 可以进入成果广场，仍需分享范围为公开 |
| 表达清晰度：基本清楚 | 主要思路能看懂，局部表达不完美 | 可以推送给提问者和加热度同学 | 老师可选择是否进入成果广场；建议有亮点标签时再公开 |
| 表达清晰度：需补充 | 关键步骤缺失或同学难以理解 | 不推送 | 不公开，退回修改 |

能力观察标签建议：

- `逻辑清晰`
- `会画图`
- `表达完整`
- `基本清楚`
- `愿意尝试表达`
- `能联系题意`

客观说明：`清楚/基本清楚/需补充`不应混同为三个发布状态。MVP应以“审核通过/退回修改”作为发布开关；清晰度与能力标签用于成长护照、老师后台筛选和成果广场推荐。

**验收标准：**

- 上传讲解时必须选择分享范围；
- `CLEAR` 和 `BASICALLY_CLEAR` 且审核通过时，可推送给提问者和加热度同学；
- `NEEDS_SUPPORT` 不推送，退回修改；
- 选择 `RELATED_ONLY` 时，只给出题人和加热度同学可见；
- 选择 `PUBLIC_GALLERY`、审核通过且老师确认适合公开后，进入成果广场；
- 封面是站内展示图片，不要求剪入视频首帧。

### 3.4 扩展项目、组队与协作模型

**文件：** `prisma/schema.prisma`

`Project` 新增字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `projectType` | `ProjectType @default(FREE_BASIC)` | 免费基础项目/5项主题包/20项长期计划 |
| `gradeRange` | `String?` | 适合年级 |
| `knowledgeTags` | `String[]` | 知识点标签 |
| `abilityTags` | `String[]` | 能力观察方向 |
| `requiredMembers` | `Int @default(3)` | 所需人数，默认3人 |
| `validDays` | `Int @default(30)` | 有效期 |
| `participationRule` | `String?` | 完成基础项目/达到基础参与条件/付费开通 |
| `isPaid` | `Boolean @default(false)` | 是否付费项目 |
| `packageName` | `String?` | 5项主题包/20项长期计划等 |
| `editableByTeacher` | `Boolean @default(true)` | 老师是否可编辑 | MVP允许老师创建/编辑自己负责的项目 |
| `archivedAt` | `DateTime?` | 归档/下架时间 | 有参与记录的项目不硬删除 |

新增枚举：

```prisma
enum ProjectType {
  FREE_BASIC
  PAID_PACKAGE_5
  PAID_PLAN_20
}
```

`Group` 新增字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `status` | `GroupStatus @default(WAITING)` | 待组队/进行中/已结营/已失效 |
| `startedAt` | `DateTime?` | 满员自动开组时间 |
| `expiresAt` | `DateTime?` | 协作空间有效期 |
| `lastActivityAt` | `DateTime?` | 最近互动，用于老师异常提醒 |

新增枚举：

```prisma
enum GroupStatus {
  WAITING
  ACTIVE
  SUBMITTED
  COMPLETED
  EXPIRED
}
```

新增模型：

```prisma
model ProjectTask {
  id          String   @id @default(cuid())
  title       String
  description String?
  sortOrder   Int
  projectId   String
  project     Project  @relation(fields: [projectId], references: [id])

  @@map("project_tasks")
}

model ProjectSubmission {
  id          String   @id @default(cuid())
  title       String
  description String?
  mediaUrl    String?
  shareScope  ShareScope @default(PRIVATE_RECORD)
  status      ContentReviewStatus @default(PENDING)
  coverImageUrl String?
  createdAt   DateTime @default(now())
  groupId     String
  group       Group @relation(fields: [groupId], references: [id])
  submittedById String
  submittedBy User @relation(fields: [submittedById], references: [id])

  @@map("project_submissions")
}
```

**验收标准：**

- 项目卡展示所需人数、组队状态、有效时长；
- 满3人自动开组并开启协作空间；
- 免费项目可异步轻协作；
- 付费项目可由管理员手动开通权限；
- 成果提交后需老师审核，公开展示必须有授权。

### 3.4.1 老师项目创建、编辑、下架规则

**产品判断：** 老师需要能创建项目、编辑介绍、上传封面、保存草稿、发布和下架；但“删除项目”不能简单硬删除，因为项目一旦有人报名、组队、提交成果，就涉及学习记录和付费/退费证据。

MVP规则：

| 场景 | 老师权限 | 说明 |
|---|---|---|
| 草稿项目 | 可编辑、可硬删除 | 未发布、无人参与，可删除 |
| 已发布但无人参与 | 可编辑、可下架、可删除 | 删除前二次确认 |
| 已有人报名/加入 | 可编辑非关键介绍、可下架、不可硬删除 | 保留历史记录 |
| 已开组/有成果 | 只能归档或下架，不可删除 | 避免破坏成长记录和付费记录 |

项目编辑字段：

- 项目名称；
- 项目简介；
- 适合年级；
- 知识点标签；
- 能力观察方向；
- 所需人数；
- 有效期；
- 参与条件；
- 免费/付费类型；
- 项目包名称；
- 封面图；
- 项目步骤/任务卡；
- 退出与延期规则。

### 3.5 新增报名意向、付费/退费记录

**文件：** `prisma/schema.prisma`

新增模型：

```prisma
model ProjectInquiry {
  id              String   @id @default(cuid())
  childName        String?
  grade            Int?
  packageName      String
  optionalContact  String?
  followStatus     InquiryFollowStatus @default(NEW)
  teacherWechatShown Boolean @default(true)
  note             String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  userId           String?
  user             User? @relation(fields: [userId], references: [id])
  projectId        String?
  project          Project? @relation(fields: [projectId], references: [id])

  @@map("project_inquiries")
}

enum InquiryFollowStatus {
  NEW
  CONTACTED
  PAID
  OPENED
  CLOSED
}

model PaymentRecord {
  id            String   @id @default(cuid())
  childName      String?
  packageName    String
  amountFen      Int?
  status         PaymentStatus @default(INTENT)
  processType    PaymentProcessType?
  processNote    String?
  handledById    String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  userId         String?
  user           User? @relation(fields: [userId], references: [id])

  @@map("payment_records")
}

enum PaymentStatus {
  INTENT
  PAID
  REFUND_REQUESTED
  PARTIAL_REFUNDED
  REFUNDED
  TRANSFERRED
  RESERVED
}

enum PaymentProcessType {
  REFUND
  DELAY
  TRANSFER_NEXT
  RESERVE_SEAT
  MANUAL_NOTE
}
```

**验收标准：**

- 报名弹窗联系方式可选；
- 提交后展示老师企业微信二维码；
- 后台可看到报名意向、可选联系方式、跟进状态；
- 付费与退费记录 MVP 可人工登记。

### 3.5.1 公开咨询入口与老师企业微信配置

新增模型：

```prisma
model SiteSetting {
  id                  String   @id @default(cuid())
  teacherWechatQrUrl   String?
  teacherWechatLabel   String?  @default("添加老师企业微信")
  consultationText      String?  @default("有问题可以先问老师")
  updatedAt             DateTime @updatedAt

  @@map("site_settings")
}
```

MVP展示位置：

| 位置 | 展示方式 | 原则 |
|---|---|---|
| 首页中后段 | “有问题想先问老师？”咨询卡片 + 企业微信二维码 | 不替代首屏主CTA |
| 页脚 | 简洁“老师咨询”入口 | 全站可见 |
| 项目营页 | 项目咨询卡片 | 支持免费/付费项目答疑 |
| 个人中心 | “联系老师”入口 | 登录后方便家长找回咨询入口 |
| 付费报名弹窗 | 提交后自动弹出二维码 | 与V2规则一致 |

客观说明：公开企业微信有助于信任与转化，但不能让首页变成“加微信咨询”落地页；首屏仍应服务“我要提问/看看孩子怎么学”。

### 3.6 新增站内通知模型

**文件：** `prisma/schema.prisma`

新增模型：

```prisma
model Notification {
  id        String   @id @default(cuid())
  type      NotificationType
  title     String
  content   String
  targetUrl String?
  isRead    Boolean @default(false)
  createdAt DateTime @default(now())
  userId    String
  user      User @relation(fields: [userId], references: [id])

  @@map("notifications")
}

enum NotificationType {
  REVIEW_APPROVED
  REVIEW_REJECTED
  ANSWER_PUBLISHED
  QUESTION_HEATED
  PROJECT_GROUP_OPENED
  PROJECT_MESSAGE
  PROJECT_TASK_UPDATED
  SYSTEM
}
```

**验收标准：**

- 导航栏“个人中心”显示未读红点或数字气泡；
- 个人中心有“我的消息 / 项目提醒 / 审核通知”；
- 老师留言、小组成员@我、任务状态变化、审核通过/退回均形成通知；
- MVP 不做站外通知。

### 3.7 积分流水与数据运转规则

当前已有 `PointTransaction`，但 V0 没有把“为什么加分、什么时候加分、积分和星级是什么关系”说清楚。V1补齐如下。

新增枚举建议：

```prisma
enum PointReason {
  QUESTION_APPROVED
  ANSWER_APPROVED
  ANSWER_QUALITY_TAG
  PROJECT_TASK_DONE
  PROJECT_COMPLETED
  PROJECT_SUBMISSION_APPROVED
  HELPED_CLASSMATES
  MANUAL_ADJUSTMENT
  VIOLATION_DEDUCTION
}
```

`PointTransaction` 增补字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `reasonCode` | `PointReason` | 结构化原因 |
| `sourceType` | `String?` | QUESTION/ANSWER/PROJECT/GROUP/SYSTEM |
| `sourceId` | `String?` | 来源对象ID |
| `visibleToUser` | `Boolean @default(true)` | 是否在个人积分流水可见 |
| `displayLabel` | `String?` | 前台给孩子看的温暖说明，如“提问成长能量” |
| `userMessage` | `String?` | 行为完成后的提示文案，可为空由系统模板生成 |

MVP积分规则：

| 行为 | 积分 | 是否影响身份星级 | 说明 |
|---|---:|---|---|
| 问题审核通过 | +2 | 影响提问者有效行为 | 鼓励真实提问 |
| 讲解审核通过，基本清楚及以上 | +5 | 影响小讲师有效行为 | 数学正确、安全、可理解 |
| 讲解获得质量标签 | +1/标签，上限+3 | 影响小讲师质量行为 | 逻辑清晰、会画图等 |
| 完成项目关键任务 | +2 | 影响探索家有效行为 | 每个项目设置任务上限 |
| 项目成果审核通过 | +6 | 影响探索家有效行为 | 可公开或仅成长记录 |
| 完成完整项目 | +10 | 影响探索家星级 | 结营后发放 |
| 手动调整 | 由管理员设置 | 不自动影响星级 | 纠错、补录、特殊情况 |
| 无故退出/违规 | 可扣分或记录异常 | 可暂停体验资格 | 避免惩罚性公开展示 |

积分与身份星级关系：

- 积分在前台儿童文案中可表达为“成长能量”或“数学成长能量”；
- 积分是私密成长账本和后台运营数据，不公开排名；
- 身份星级主要由有效行为和质量行为触发，不由积分直接兑换；
- 项目“参与条件”可以参考积分或有效行为，但公开文案不显示具体积分门槛；
- 后台可以看到积分流水，学习者/家长只能在个人中心查看自己的流水；
- 个人中心 / 成长护照必须提供完整规则说明：成长能量从哪里来、有什么用、为什么不用于公开排名；
- 提问、认领讲题、项目报名、作品提交等关键行动页必须显示即时轻提示，告诉孩子本次行为会如何记录成长；
- 首页不突出积分规则，避免把产品第一印象做成积分平台。

数据跑通链路：

1. 用户完成行为；
2. 老师审核或系统确认；
3. 写入业务对象状态；
4. 写入 `PointTransaction`；
5. 更新 `IdentityProgress`；
6. 生成 `Notification`；
7. 个人中心展示成长记录。

**验收标准：**

- 每一笔积分都有 `reasonCode` 和来源对象；
- 不存在前端只显示积分、后台无流水的情况；
- 不因刷邀请、刷点击、重复加热度获得积分；
- 积分可回溯、可人工修正。

---

## 四、前端页面任务

### 4.1 全站导航与登录边界

**文件：**

- 修改：`components/navbar.tsx`
- 修改：`app/login/page.tsx`
- 修改：`app/register/page.tsx`

**任务：**

- [ ] 主导航固定为：`首页 / 你问我答 / 项目营 / 成果广场 / 个人中心`。
- [ ] 移除普通学习者可见的“老师台/管理员后台”主导航入口；学习者、老师、管理员均可从个人中心登录账号后按角色分流进入各自工作页面。
- [ ] 未登录用户点击受保护操作时，跳转登录页并携带 `callbackUrl`，登录后回到原流程。
- [ ] 导航栏个人中心显示未读消息红点；未登录时点击个人中心进入登录；登录后个人中心根据角色显示“学习者个人中心 / 老师工作台入口 / 管理员后台入口”。
- [ ] 修复移动端汉堡按钮重复渲染问题，确保只有一个折叠菜单按钮。

**验收标准：**

- 手机、平板、电脑均能访问 5 个主入口；
- 登录/注册不是主导航项；
- 普通学习者看不到老师工作台入口；
- 有未读通知时个人中心显示红点或数字。

### 4.2 首页

**文件：**

- 重构：`app/page.tsx`
- 可抽取组件：`components/home/hero.tsx`、`components/home/learning-path.tsx`、`components/home/audience-fit.tsx`、`components/home/preview-sections.tsx`

**任务：**

- [ ] 首屏显示：`数学小讲师联盟 / 会思考，爱数学 / 小学低年级孩子的数学共学社区`。
- [ ] 标签显示：`小学1–3年级 / 同伴互助 / 项目制学习 / 真实思考`。
- [ ] 首屏按钮为：`我要提问`、`看看孩子怎么学`。
- [ ] “我要提问”进入提交问题流程；“看看孩子怎么学”跳转首页内部学习路径模块。
- [ ] 展示温暖数据：已提出好问题、已解答问题、参与探索孩子数、完成协作小组数。
- [ ] 展示能力星云静态版：画图表达、勇敢提问、认真倾听、合作探索、讲清思路、发现规律。
- [ ] 展示孩子怎么学四步：提出问题、当小讲师、做项目、留作品。
- [ ] 展示适合谁/暂不优先适合谁，各3条。
- [ ] 展示你问我答、项目营、成果广场预览。
- [ ] 展示安全、审核与低焦虑承诺。
- [ ] 首页中后段增加“有问题想先问老师？”公开咨询卡片，展示老师企业微信二维码；不放在首屏主CTA位置。

**验收标准：**

- 首页无“低焦虑成长”作为卖点标签；
- 首页无“思维开窍”；
- 首页无排行榜、最高赞、最火等表达；
- 首页移动端为单列卡片流，电脑端为 2–3 列区块。

### 4.3 你问我答首页

**文件：**

- 修改：`app/qa/page.tsx`
- 修改：`app/api/questions/route.ts`
- 新增组件：`components/qa/question-card.tsx`、`components/qa/recommended-answer-card.tsx`、`components/qa/heat-explainer-modal.tsx`

**任务：**

- [ ] 页面标题改为：`你问我答：孩子提出问题，孩子尝试讲清楚`。
- [ ] 顶部按钮为：`我要提问`、`我要当小讲师`。
- [ ] 增加温暖数据：已有问题数、已解答数、被帮助同学数。
- [ ] 增加筛选：年级、知识点、状态、热度排序。
- [ ] 问题卡显示：原题缩略图、标题、年级、知识点、困惑类型、热度、查看详情、我也有困惑、我来讲。
- [ ] 电脑端右栏、手机端下方统一显示“推荐讲解”。
- [ ] “热度”旁有说明入口，点击弹出热度说明弹框。

**验收标准：**

- 列表页不出现“已发布讲解 / 推荐讲解”双标题；
- 热度说明明确“不是比赛，也不是排名”；
- 同一用户只能对同一道题加一次热度。

### 4.4 提交问题页

**文件：**

- 修改：`app/qa/ask/page.tsx`
- 修改：`app/api/questions/route.ts`
- 新增组件：`components/qa/question-form.tsx`

**任务：**

- [ ] 表单字段顺序：上传原题、题目文字版、问题标题、年级、知识点、我哪里想不明白。
- [ ] “问题标题”下方显示灰色说明：给这道题起一个方便别人看懂的名字，不是写解题过程；系统会先生成，家长只需确认或微调。
- [ ] 支持上传图片 URL 字段；MVP 可先使用输入 URL 或本地模拟上传，正式对象存储后置。
- [ ] 知识点选项改为按年级联动：小学1–3年级内置知识点标签；先选年级，再从该年级标签中下拉选择，保留“其他”。
- [ ] 困惑类型选项：看不懂题意、不知道先算什么、画图不会画、算式会错、有两种想法不确定、其他。
- [ ] 提交后进入老师审核状态，不直接公开。

**验收标准：**

- 低年级孩子不需要独立概括复杂标题；
- 家长可辅助确认题目文字和标题；
- 未登录点击提交时进入登录并回到提交流程。

### 4.5 问题详情、热度、认领与上传讲解

**文件：**

- 修改：`app/qa/question/[id]/page.tsx`
- 修改：`app/api/questions/[id]/route.ts`
- 修改：`app/api/questions/[id]/claim/route.ts`
- 修改：`app/api/answers/route.ts`
- 新增 API：`app/api/questions/[id]/heat/route.ts`
- 新增 API：`app/api/questions/[id]/release/route.ts`
- 新增组件：`components/qa/claim-modal.tsx`、`components/qa/upload-answer-form.tsx`

**任务：**

- [ ] 问题详情展示原题图、题目文字、问题标题、年级、知识点、困惑类型、热度数。
- [ ] “我也有困惑”调用 heat API；重复点击返回温和提示。
- [ ] “我来讲”弹出认领弹窗。
- [ ] 认领弹窗显示：72小时保留、开场简单自我介绍、题目展示完整、过程看得见、请假退出规则。
- [ ] 认领成功后写入 `claimedById`、`claimedAt`、`claimExpiresAt`。
- [ ] 上传讲解表单显示倒计时和讲题封面预览。
- [ ] 上传讲解必须选择分享范围：相关同学 / 成果广场。
- [ ] 请假退出释放题目，并记录释放状态。

**验收标准：**

- 72小时倒计时准确；
- 其他用户不能认领已被保留的问题；
- 请假退出后题目可再次认领；
- 分享范围默认不公开到成果广场。

### 4.6 项目营首页与项目详情

**文件：**

- 修改：`app/projects/page.tsx`
- 修改：`app/projects/[id]/page.tsx`
- 修改：`app/api/projects/route.ts`
- 修改：`app/api/projects/[id]/route.ts`
- 新增组件：`components/projects/project-card.tsx`、`components/projects/project-package-card.tsx`、`components/projects/project-inquiry-modal.tsx`

**任务：**

- [ ] 项目营标题：`项目营：用数学完成真实小任务`。
- [ ] 分区展示：免费基础项目、付费主题项目包。
- [ ] 项目卡展示：项目名称、适合年级、核心知识点、能力观察、所需人数、参与条件、组队状态、有效时长。
- [ ] 项目卡不公开展示“20积分”等显性积分门槛。
- [ ] 组队状态显示：第一组已加入2名，还缺1名；满3人自动开组并开启协作空间。
- [ ] 付费项目包展示：5项主题项目包、20项长期计划。
- [ ] 付费项目详情必须展示退出与延期规则。
- [ ] 老师工作台增加项目管理页：创建项目、编辑项目、保存草稿、上传/更换封面图、发布、下架、归档；仅草稿或无人参与项目允许硬删除。

**验收标准：**

- 项目卡上能看清所需人数和组队状态；
- 免费项目与付费项目区别在复杂程度、老师参与深度、反馈深度，不是质量高低；
- 付费项目前不隐藏退出规则。

### 4.7 付费项目报名意向

**文件：**

- 修改：`app/api/projects/[id]/register/route.ts`
- 新增 API：`app/api/project-inquiries/route.ts`
- 新增组件：`components/projects/project-inquiry-modal.tsx`

**任务：**

- [ ] 报名弹窗字段：孩子昵称、年级、项目包选择、可选联系方式。
- [ ] 可选联系方式下方灰色说明：不强制填写；也可以直接扫码添加老师企业微信。
- [ ] 提交后展示老师企业微信二维码。
- [ ] 后台记录：报名意向、项目包、可选联系方式、是否展示二维码、跟进状态。
- [ ] 管理员可把报名意向转为付费记录和项目权限。

**验收标准：**

- 不强制家长填写联系方式；
- 如果家长填写，老师后台可跟进；
- 提交后一定能看到企业微信二维码；
- 不接自动支付。

### 4.8 项目协作空间

**文件：**

- 修改：`app/groups/[id]/page.tsx`
- 修改：`app/api/groups/[id]/messages/route.ts`
- 新增 API：`app/api/groups/[id]/tasks/route.ts`
- 新增 API：`app/api/groups/[id]/submissions/route.ts`
- 新增组件：`components/groups/task-list.tsx`、`components/groups/message-stream.tsx`、`components/groups/project-progress.tsx`、`components/groups/project-submission-form.tsx`

**任务：**

- [ ] 协作空间顶部显示项目名、当前阶段、有效期剩余、小组成员、请假退出。
- [ ] 左侧/上方显示任务卡：观察、测量、记录、交流、提交成果。
- [ ] 右侧/下方显示小组留言流，支持文字和图片/语音/视频 URL 占位。
- [ ] 老师留言、成员@我、任务状态变化生成站内通知。
- [ ] 项目进度显示：已加入、已组队、已分工、已提交草稿、已完成作品、老师审核、已结营。
- [ ] 最终成果提交字段：成果标题、成果说明、媒体、分享范围。
- [ ] 项目完成反馈入口可跳过。

**验收标准：**

- 满3人自动开组后才能进入协作空间；
- 未加入小组的学习者不能查看小组内部留言；
- 老师和小组成员留言有站内提醒；
- MVP 不做实时文档、视频会议、复杂群聊。

### 4.9 成果广场与成果详情

**文件：**

- 修改：`app/hall/page.tsx`
- 修改：`app/api/hall/route.ts`
- 新增页面：`app/hall/[id]/page.tsx`
- 新增组件：`components/hall/outcome-card.tsx`、`components/hall/outcome-detail.tsx`

**任务：**

- [ ] 成果广场标题：`看见孩子真实的数学表达和项目探索`。
- [ ] 只展示已审核、已授权、无隐私风险内容。
- [ ] 筛选：成果类型、知识点、项目主题、年级。
- [ ] 成果卡展示类型化封面、标题、小讲师/小组、身份星级、点赞鼓励、分享按钮；成果广场内所有作品默认可被所有访客转发分享。
- [ ] 成果详情展示视频或作品内容、作品说明、相关问题/项目、点赞鼓励、行动号召。
- [ ] 点赞文案为鼓励和感谢，不做排名。
- [ ] 分享链接/海报只使用公开作品信息，不带真实姓名、学校、联系方式、积分或后台评价标签。

**验收标准：**

- 未审核内容不进成果广场；
- `RELATED_ONLY` 分享范围不进入成果广场；
- 成果广场不展示积分、后台评价标签、真实姓名、学校、联系方式。

### 4.10 类型化封面与分享海报

**文件：**

- 新增组件：`components/share/cover-card.tsx`
- 新增组件：`components/share/share-poster.tsx`
- 新增 API：`app/api/share/poster/route.ts`

**任务：**

- [ ] 支持小讲师讲题视频封面：Logo、我来讲这道题、题目标题、知识点、小讲师昵称、会思考爱数学。
- [ ] 支持项目成果封面：Logo、我们完成了一个数学小项目、项目标题、3人小组、知识点或能力收获、会思考爱数学。
- [ ] 支持分享海报模板：我讲清了一道题、我们完成了一个项目、我提出了一个好问题、我的成长护照小结。
- [ ] 分享海报可使用 HTML/CSS 生成预览；MVP 可先提供 PNG 导出后置，先实现站内预览和二维码占位。
- [ ] 海报二维码使用用户 `inviteCode` 或成果链接，不做邀请排行榜。

**验收标准：**

- 讲题封面和项目封面不共用一个模板；
- 封面是站内展示图片，不要求剪入视频；
- “我提出了一个好问题”模板可用于只提问的孩子。

### 4.11 个人中心

**文件：**

- 修改：`app/profile/page.tsx`
- 修改：`app/api/user/profile/route.ts`
- 新增 API：`app/api/notifications/route.ts`
- 新增 API：`app/api/notifications/[id]/read/route.ts`
- 新增组件：`components/profile/profile-card.tsx`、`components/profile/growth-passport.tsx`、`components/profile/my-impact.tsx`、`components/profile/notification-list.tsx`

**任务：**

- [ ] 孩子资料卡显示头像、昵称、年级、一句话数学介绍。
- [ ] 显示提问者/小讲师/探索家灰色或点亮状态，点亮后显示星级。
- [ ] 我的提问、我的讲解、我的项目、成长护照四个模块。
- [ ] 我的影响力文案使用：`我的分享启发了 X 位同学开始一次数学探索`。
- [ ] 消息中心分为：我的消息、项目提醒、审核通知。
- [ ] 隐私与分享范围模块列出作品当前分享范围。
- [ ] 新增“我的数学成长能量”模块，展示当前成长能量、成长能量从哪里来、可以做什么、最近流水。
- [ ] 成长能量说明必须写明：不用于公开排名，也不代表谁更聪明，只记录提问、讲解、探索和帮助同学中的真实努力。

**验收标准：**

- 积分流水只在个人中心私密可见，不公开；
- 积分规则完整说明放在个人中心 / 成长护照，行动页只做轻提示，首页不突出积分；
- 能力观察记录仅对自己/老师/管理员可见；
- 个人中心是学习者、老师、管理员的角色分流入口。

### 4.12 老师工作台

**文件：**

- 修改：`app/teacher/page.tsx`
- 修改：`app/api/teacher/dashboard/route.ts`
- 修改：`app/api/teacher/answers/route.ts`
- 修改：`app/api/teacher/answers/[id]/review/route.ts`
- 新增 API：`app/api/teacher/questions/[id]/review/route.ts`
- 新增 API：`app/api/teacher/submissions/[id]/review/route.ts`
- 新增组件：`components/teacher/review-list.tsx`、`components/teacher/review-sidebar.tsx`、`components/teacher/project-monitor.tsx`

**任务：**

- [ ] 老师工作台首页展示今日待处理：待审核问题、待审核讲解、待审核项目成果、异常提醒。
- [ ] 待审核问题支持通过、退回、补标知识点。
- [ ] 待审核讲解支持数学正确性、表达清晰度、能力观察标签、退回原因/温暖提示。
- [ ] 项目成果审核支持通过、退回、是否进入成果广场。
- [ ] 项目管理显示小组、成员、当前阶段、有效期、最近互动、异常。
- [ ] 项目管理支持老师创建、编辑、保存草稿、上传封面、发布、下架、归档项目；删除必须受参与记录保护。
- [ ] 72小时未上传、项目小组N天无互动、项目节点逾期进入异常提醒。

**验收标准：**

- 老师审核通过后自动生成站内通知；
- 免费体验不默认要求老师写详细个性化点评；
- 能力标签数量保持少而清晰，避免增加老师负担。

### 4.13 管理员后台

**文件：**

- 新增页面：`app/admin/page.tsx`
- 新增 API：`app/api/admin/users/route.ts`
- 新增 API：`app/api/admin/project-permissions/route.ts`
- 新增 API：`app/api/admin/inquiries/route.ts`
- 新增 API：`app/api/admin/payments/route.ts`
- 新增 API：`app/api/admin/teachers/route.ts`
- 新增组件：`components/admin/admin-dashboard.tsx`、`components/admin/project-permission-form.tsx`、`components/admin/payment-record-form.tsx`

**任务：**

- [ ] 管理员后台首页展示用户数、学习者数、项目参与数、待处理权限、待处理报名。
- [ ] 用户管理支持查看学习者、老师、管理员。
- [ ] 项目权限支持手动开通项目包、设置有效期、备注。
- [ ] 报名管理支持查看报名意向、可选联系方式、跟进状态、企业微信二维码已展示状态。
- [ ] 付费与退费记录支持新增、查看、处理退款/延期/转期/保留名额。
- [ ] 教师权限分配支持设置负责项目和审核权限。

**验收标准：**

- 普通学习者不能访问 `/admin`；
- 老师不能访问管理员权限配置；
- 管理员可完成 MVP 手动开通付费项目权限。

---

## 五、后端 API 与权限任务

### 5.1 权限守卫

**文件：**

- 修改：`lib/api-guard.ts`
- 修改：`lib/auth.ts`
- 新增：`lib/permissions.ts`

**任务：**

- [ ] 定义角色权限：STUDENT、TEACHER、ADMIN。
- [ ] 定义 API 守卫：必须登录、必须学习者、必须老师、必须管理员、本人或老师/管理员。
- [ ] 学习者只能管理自己的问题、讲解、项目参与、消息。
- [ ] 老师可以审核内容、查看负责项目、小组和学生提交。
- [ ] 管理员可以管理用户、教师权限、项目权限、付费/退费记录。
- [ ] 路由层严格隔离：`/profile` 为统一登录后角色分流；`/teacher` 仅老师/管理员可进；`/admin` 仅管理员可进。

**验收标准：**

- 未登录调用受保护 API 返回 401；
- 权限不足返回 403；
- API 不依赖前端隐藏按钮来保护权限。

### 5.2 通知服务

**文件：**

- 新增：`lib/notifications.ts`
- 新增 API：`app/api/notifications/route.ts`
- 新增 API：`app/api/notifications/[id]/read/route.ts`

**任务：**

- [ ] 封装 `createNotification(userId, type, title, content, targetUrl)`。
- [ ] 审核通过/退回生成通知。
- [ ] 讲解发布后通知提问者和所有加热度同学。
- [ ] 项目满员开组后通知组员。
- [ ] 小组留言通知组员，避免通知留言本人。
- [ ] 支持查询未读数和标记已读。

**验收标准：**

- 导航未读数来自统一 API；
- 个人中心消息列表能按类型筛选；
- 不做站外通知。

### 5.3 项目自动开组服务

**文件：**

- 新增：`lib/project-groups.ts`
- 修改：`app/api/projects/[id]/register/route.ts`

**任务：**

- [ ] 学习者申请参加项目后进入等待组队。
- [ ] 系统查找同项目 `WAITING` 小组。
- [ ] 若小组人数未满，则加入该小组。
- [ ] 若没有等待小组，则创建新等待小组。
- [ ] 当人数达到 `requiredMembers`，小组状态改为 `ACTIVE`，设置 `startedAt` 和 `expiresAt`，生成项目提醒通知。

**验收标准：**

- 默认3人自动开组；
- 开组不是“解锁个人资格”，而是“开启协作空间”；
- 未满员时页面显示还缺几人。

### 5.4 内容审核服务

**文件：**

- 新增：`lib/review.ts`
- 修改老师审核 API

**任务：**

- [ ] 问题审核通过后可在你问我答列表展示。
- [ ] 讲解审核通过后按分享范围发布。
- [ ] 项目成果审核通过后按分享范围进入成长记录或成果广场。
- [ ] 审核退回必须有温暖提示。
- [ ] 审核通过/退回均生成通知。

**验收标准：**

- 所有公开内容必须先审核；
- 退回文案不羞辱孩子；
- 成果广场只展示公开授权内容。

---

## 六、测试与验收任务

### 6.1 基础质量命令

**命令：**

```bash
npm run build
```

**验收标准：**

- TypeScript 编译通过；
- Next.js build 无阻断错误；
- Prisma Client 可生成；
- 生产构建可启动。

### 6.2 数据库迁移验收

**命令：**

```bash
npx prisma validate
npx prisma generate
npx prisma db push
```

**验收标准：**

- Prisma schema 语法正确；
- 新增模型和枚举可生成 Client；
- 数据库可同步；
- 旧数据不因非空字段无默认值而迁移失败。

### 6.3 关键用户路径验收

#### 路径 A：提问者

- [ ] 未登录访问你问我答可浏览问题；
- [ ] 点击我要提问进入登录；
- [ ] 登录后回到提交问题页；
- [ ] 上传/填写题目、标题、年级、知识点、困惑类型；
- [ ] 提交后进入待审核；
- [ ] 老师审核通过后出现在列表；
- [ ] 其他同学可加热度；
- [ ] 讲解发布后收到通知。

#### 路径 B：小讲师

- [ ] 登录后进入你问我答；
- [ ] 选择待认领问题；
- [ ] 查看认领弹窗和视频建议；
- [ ] 确认认领后出现72小时倒计时；
- [ ] 上传讲解并选择分享范围；
- [ ] 老师审核通过；
- [ ] 相关同学收到通知；
- [ ] 若选择成果广场且审核通过，成果广场可见。

#### 路径 C：项目探索

- [ ] 进入项目营；
- [ ] 查看项目卡所需人数、参与条件、组队状态、有效时长；
- [ ] 申请参加免费项目；
- [ ] 未满3人时显示等待组队；
- [ ] 满3人后自动开组并开启协作空间；
- [ ] 小组成员留言产生提醒；
- [ ] 提交最终成果并选择分享范围；
- [ ] 老师审核后进入成长记录或成果广场。

#### 路径 D：付费项目咨询

- [ ] 进入付费主题项目包；
- [ ] 查看项目包说明、退出与延期规则；
- [ ] 点击报名咨询；
- [ ] 填写孩子昵称、年级、项目包，可选填写联系方式；
- [ ] 提交后看到老师企业微信二维码；
- [ ] 管理员后台看到报名意向；
- [ ] 管理员可手动登记付费记录并开通项目权限。

#### 路径 E：老师与管理员

- [ ] 老师登录后可进入老师工作台；
- [ ] 老师能审核问题、讲解、项目成果；
- [ ] 老师能查看项目小组节点和异常；
- [ ] 管理员能访问管理员后台；
- [ ] 管理员能手动开通项目权限、登记付费/退费、分配教师权限；
- [ ] 学习者无法访问老师/管理员后台。

---

## 七、开发优先级与批次

### 批次 0：工程安全与数据地基

| 编号 | 任务 | 优先级 | 依赖 |
|---|---|---|---|
| B0-1 | Prisma schema 扩展 | P0 | 无 |
| B0-2 | 权限守卫 `lib/permissions.ts` | P0 | 现有 auth |
| B0-3 | 通知模型与通知服务 | P0 | Prisma 扩展 |
| B0-4 | 项目自动开组服务 | P0 | Prisma 扩展 |
| B0-5 | 内容审核通用服务 | P0 | Prisma 扩展、通知服务 |
| B0-6 | 身份星级与积分流水服务 | P0 | User、IdentityProgress、PointTransaction |
| B0-7 | 1–3年级知识点标签常量/API | P0 | 无 |

### 批次 1：首页、导航、你问我答闭环

| 编号 | 任务 | 优先级 | 依赖 |
|---|---|---|---|
| B1-1 | 导航重构 | P0 | 权限守卫、通知未读数 API |
| B1-2 | 首页 V2 重构 | P0 | 无 |
| B1-3 | 你问我答首页重构 | P0 | 问题 API |
| B1-4 | 提交问题表单 | P0 | 问题模型 |
| B1-5 | 热度 API 与热度说明弹窗 | P0 | QuestionHeat |
| B1-6 | 认领与72小时倒计时 | P0 | 问题模型 |
| B1-7 | 上传讲解与分享范围 | P0 | Answer 扩展 |
| B1-8 | 老师审核问题/讲解 | P0 | 审核服务 |

### 批次 2：项目营与协作空间闭环

| 编号 | 任务 | 优先级 | 依赖 |
|---|---|---|---|
| B2-1 | 项目营首页与项目卡 | P0 | Project 扩展 |
| B2-2 | 项目详情页 | P0 | Project 扩展 |
| B2-3 | 付费报名意向弹窗 | P0 | ProjectInquiry |
| B2-4 | 自动组队与开组 | P0 | 项目自动开组服务 |
| B2-5 | 协作空间任务卡与留言流 | P0 | Group、Message、Notification |
| B2-6 | 最终成果提交 | P0 | ProjectSubmission |
| B2-7 | 项目成果审核 | P0 | 审核服务 |

### 批次 3：成果广场、个人中心、后台

| 编号 | 任务 | 优先级 | 依赖 |
|---|---|---|---|
| B3-1 | 成果广场列表与详情 | P0 | Answer、ProjectSubmission 审核发布 |
| B3-2 | 类型化封面组件 | P0 | Answer、ProjectSubmission cover 字段 |
| B3-3 | 分享海报预览 | P0/P1 | inviteCode、成果链接 |
| B3-4 | 个人中心资料卡与成长护照 | P0 | User 扩展 |
| B3-5 | 我的消息/项目提醒/审核通知 | P0 | Notification |
| B3-6 | 我的影响力 | P0/P1 | inviteCode、统计 API |
| B3-7 | 管理员后台 | P0 | 管理员权限 |
| B3-8 | 付费/退费记录后台 | P0 | PaymentRecord |
| B3-9 | 教师权限分配 | P0 | 用户角色与项目权限 |
| B3-10 | 老师项目创建/编辑/下架页面 | P0 | Project 扩展、老师权限 |
| B3-11 | 公开老师企业微信咨询入口 | P0 | SiteSetting |

### 批次 4：验收、文案、响应式与上线准备

| 编号 | 任务 | 优先级 | 依赖 |
|---|---|---|---|
| B4-1 | 全站响应式检查 | P0 | 前台页面完成 |
| B4-2 | 低焦虑文案检查 | P0 | 前台页面完成 |
| B4-3 | 权限穿透测试 | P0 | 后台完成 |
| B4-4 | 关键路径手动验收 | P0 | 全部 P0 完成 |
| B4-5 | Build 与 Prisma 验证 | P0 | 全部 P0 完成 |
| B4-6 | 种子数据与演示账号 | P0 | 数据模型稳定 |
| B4-7 | 阶段3最终交付文档 | P0 | MVP清单确认 |

---

## 八、P1 后置清单

以下能力不进入 MVP 第一轮，但需要在文档中保留接口空间：

1. OCR 自动识别题目文字；
2. 对象存储正式上传图片/视频/语音；
3. 自动生成 PNG 分享海报；
4. 视频封面自动合成进视频首帧；
5. 微信/短信/邮件站外通知；
6. 能力标签驱动的智能组队；
7. 项目贡献 AI 摘要；
8. 在线协作文档；
9. 自动支付与自动退款；
10. 更丰富的视觉动效与能力星云动画。

---

## 九、开发验收总清单

### 9.1 产品原则验收

- [ ] 没有公开排行榜；
- [ ] 没有公开积分总数；
- [ ] 没有“最高赞”“最火”“超过多少人”等表达；
- [ ] 首页使用“真实思考”而非“低焦虑成长”或“思维开窍”；
- [ ] 提问、讲题、项目探索三类孩子都能被看见；
- [ ] 付费核心在项目包/主题营，不在基础提问和讲题；
- [ ] 成果广场作品均可公开转发，但只有已审核且授权公开的作品才能进入成果广场；
- [ ] 星级、积分、能力标签均不制造公开比较；
- [ ] 老师审核守安全和数学正确性，不默认把孩子表达成人化。

### 9.2 功能闭环验收

- [ ] 提问闭环完成；
- [ ] 热度闭环完成；
- [ ] 认领与72小时上传闭环完成；
- [ ] 讲解审核与发布闭环完成；
- [ ] 项目报名/组队/协作/成果提交闭环完成；
- [ ] 付费报名意向与后台跟进闭环完成；
- [ ] 成果广场展示闭环完成；
- [ ] 个人中心消息与成长记录闭环完成；
- [ ] 老师审核闭环完成；
- [ ] 管理员手动开通与付费/退费记录闭环完成；
- [ ] 身份星级点亮闭环完成；
- [ ] 积分流水可回溯闭环完成；
- [ ] 知识点标签选择与老师补标闭环完成；
- [ ] 公开老师企业微信咨询入口完成。

### 9.3 工程验收

- [ ] `npx prisma validate` 通过；
- [ ] `npx prisma generate` 通过；
- [ ] `npx prisma db push` 可执行；
- [ ] `npm run build` 通过；
- [ ] 未登录、学习者、老师、管理员权限测试通过；
- [ ] 手机、平板、电脑核心页面可用；
- [ ] 种子数据覆盖问题、讲解、项目、小组、成果、老师、管理员。

---

## 十、V1吸收反馈的修订清单

1. 补齐提问者/小讲师/探索家三种身份星级的数据规则：1星代表开始真实行为，2星代表稳定参与，3星代表较深参与与质量行为；不把10次作为第一颗星门槛。
2. 将“清楚/基本清楚/需补充”从发布状态中拆出来，改为表达清晰度观察；发布开关由“审核通过/退回修改”决定，能力标签增加逻辑清晰、会画图、表达完整、基本清楚、愿意尝试表达等。
3. 明确成果广场内所有作品均可被访客转发分享；但前提是作品已审核、已授权公开、无隐私风险。
4. 增加老师项目管理权限：创建、编辑、保存草稿、上传封面、发布、下架、归档；有参与记录的项目不硬删除。
5. 明确学习者、老师、管理员工作页面严格区分：个人中心是统一登录与角色分流入口，后台路由和API权限必须隔离。
6. 增加小学1–3年级内置数学知识点标签，下拉选择，老师可补标。
7. 增加公开老师企业微信入口：首页中后段、页脚、项目营、个人中心均可出现，但不替代首屏主CTA。
8. 补齐积分流水系统：积分原因枚举、积分规则、触发点、与星级的关系、后台回溯和反作弊边界。

---

## 十一、下一步建议

1. 先确认本《MVP 开发任务清单 V1》的范围和优先级；
2. 若无方向性问题，进入代码实施前建议先生成一份更工程化的《实施计划 V0》，按任务拆到具体文件、API、数据模型和验证命令；
3. 本清单确认后，阶段3最终交付文档应整合：阶段3页面原型与 MVP 功能拆解 V2、UI低保真线框图 V2、MVP开发任务清单 V0，并排除被替换或降级内容。
