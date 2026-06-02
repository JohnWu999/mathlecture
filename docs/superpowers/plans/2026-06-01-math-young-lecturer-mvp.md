# Math Young Lecturer MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved 数学小讲师联盟 MVP from the accepted product rules, homepage V1 visual direction, and share poster V1 system.

**Architecture:** Keep the existing Next.js 14 App Router foundation and refactor module-by-module. Extract product copy, visual tokens, and share rules into reusable libraries first, then upgrade data models and pages around the three core loops: Q&A, project camp, and public outcomes. Protect child data through review + authorization checks at API and UI boundaries.

**Tech Stack:** Next.js 14, React 18, TypeScript, Prisma, PostgreSQL, NextAuth, Tailwind CSS.

---

## File Structure

- `lib/product-copy.ts` — single source of truth for public names, slogan, CTAs, identities, and warm microcopy.
- `lib/visual-tokens.ts` — colors, shadows, radii, poster scene colors, and growth-world tokens.
- `lib/share-rules.ts` — review/authorization visibility helpers for public sharing.
- `components/brand/infinity-logo.tsx` — brand mark shared by navbar, homepage, posters.
- `components/brand/growth-motifs.tsx` — sprout/tree/forest motifs with text-safe usage.
- `components/share/share-poster-card.tsx` — reusable poster/card renderer for 问题发芽 / 讲解长高 / 项目成林.
- `components/share/poster-scenes.tsx` — scene-specific illustrations that never cover text.
- `components/ui/badge.tsx` and `components/ui/card.tsx` — small shared UI primitives.
- `prisma/schema.prisma` — data model upgrade for identity progress, ability tags, share assets, export logs, review/share statuses.
- `app/page.tsx` — accepted homepage V1 implementation.
- `app/qa/*` and `app/api/questions/*` — Q&A loop.
- `app/projects/*`, `app/groups/*`, and related APIs — project camp loop.
- `app/hall/page.tsx` and `app/api/hall/route.ts` — public outcomes with review + authorization filters.
- `app/profile/page.tsx` and `app/api/user/profile/route.ts` — child-centered personal center/growth passport.
- `app/teacher/page.tsx`, `app/admin/page.tsx`, `app/api/teacher/*`, `app/api/admin/*` — role-separated operations.

---

### Task 1: Baseline Build and Product Constants

**Files:**
- Create: `lib/product-copy.ts`
- Create: `lib/visual-tokens.ts`
- Modify: `package.json`
- Test: `npm run build`

- [ ] **Step 1: Run current build**

Run:

```bash
npm install
npm run build
```

Expected: Either PASS or a concrete TypeScript/build error list. Do not start feature work until build blockers are documented.

- [ ] **Step 2: Add product copy constants**

Create `lib/product-copy.ts`:

```ts
export const SITE = {
  name: "数学小讲师联盟",
  slogan: "会思考，爱数学",
  heroTitle: "让一个好问题，长成一片数学森林",
  primaryCta: "我要提问",
  secondaryCta: "看孩子如何成长",
} as const;

export const PUBLIC_IDENTITIES = [
  { key: "questioner", label: "提问者", scene: "问题发芽" },
  { key: "lecturer", label: "小讲师", scene: "讲解长高" },
  { key: "explorer", label: "探索家", scene: "项目成林" },
] as const;

export const WARM_COPY = {
  questionThanks: "谢谢你把问题说出来",
  lectureSlowly: "慢慢讲，我们听得见",
  noRanking: "不做排名，不公开积分",
  publicSafety: "只展示已审核、已授权公开的作品",
} as const;
```

- [ ] **Step 3: Add visual tokens**

Create `lib/visual-tokens.ts`:

```ts
export const colors = {
  ink: "#14352b",
  green: "#184638",
  leaf: "#2f8f67",
  sprout: "#8bd86f",
  cream: "#fffdf3",
  paper: "#fff8e8",
  sun: "#ffd166",
  orange: "#f9733d",
  blue: "#3b82f6",
  muted: "#49675c",
  soil: "#8b6b4a",
} as const;

export const posterScenes = {
  question: { label: "问题发芽", accent: colors.leaf, title: "我提出了一个好问题" },
  answer: { label: "讲解长高", accent: colors.orange, title: "我把这个方法讲清楚了" },
  project: { label: "项目成林", accent: colors.blue, title: "我们一起完成了一个项目" },
} as const;
```

- [ ] **Step 4: Add check script if missing**

Modify `package.json` scripts to include:

```json
"check": "next build"
```

Expected: `npm run check` runs Next.js build.

- [ ] **Step 5: Commit**

```bash
git add package.json lib/product-copy.ts lib/visual-tokens.ts
git commit -m "chore: add product constants and visual tokens"
```

---

### Task 2: Brand and Text-Safe Growth Motif Components

**Files:**
- Create: `components/brand/infinity-logo.tsx`
- Create: `components/brand/growth-motifs.tsx`
- Create: `components/ui/badge.tsx`
- Create: `components/ui/card.tsx`
- Test: `npm run build`

- [ ] **Step 1: Create logo component**

Create `components/brand/infinity-logo.tsx`:

```tsx
export function InfinityLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 86" aria-label="数学小讲师联盟标识" className={className}>
      <path d="M20 43C36 10 62 11 70 43C78 75 104 76 120 43C104 10 78 11 70 43C62 75 36 76 20 43Z" fill="none" stroke="currentColor" strokeWidth="9.5" strokeLinecap="round" />
      <circle cx="48" cy="27" r="8" fill="#ffd166" />
      <circle cx="92" cy="59" r="8" fill="#3b82f6" />
      <path d="M58 39c7 7 17 7 24 0" fill="none" stroke="#f9733d" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
```

- [ ] **Step 2: Create growth motifs**

Create `components/brand/growth-motifs.tsx` with motif components that never position themselves over text:

```tsx
export function SproutMotif({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none rounded-full bg-[#8bd86f]/30 ${className}`} />;
}

export function SideTreeMotif({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none relative ${className}`}>
      <div className="absolute bottom-0 left-1/2 h-16 w-3 -translate-x-1/2 rounded-full bg-[#8b6b4a]/80" />
      <div className="absolute bottom-10 left-1/2 h-20 w-24 -translate-x-1/2 rounded-[50%] bg-[#2f8f67]/70" />
    </div>
  );
}

export function ForestMotif({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`pointer-events-none rounded-[32px] bg-gradient-to-b from-[#dff0ff]/70 to-[#2f8f67]/10 ${className}`} />;
}
```

- [ ] **Step 3: Create Badge primitive**

Create `components/ui/badge.tsx`:

```tsx
import type { ReactNode } from "react";

export function Badge({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full border border-[#184638]/10 bg-white/85 px-3 py-1 text-sm font-black text-[#184638] shadow-sm ${className}`}>
      {children}
    </span>
  );
}
```

- [ ] **Step 4: Create Card primitive**

Create `components/ui/card.tsx`:

```tsx
import type { ReactNode } from "react";

export function SoftCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[28px] border border-[#184638]/10 bg-[#fffdf3]/90 shadow-[0_14px_36px_rgba(24,70,56,.12)] ${className}`}>{children}</div>;
}
```

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add components/brand components/ui
git commit -m "feat: add brand and growth UI components"
```

---

### Task 3: Prisma Model Upgrade for MVP Rules

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `prisma/seed-data.sql`
- Test: `npx prisma validate`

- [ ] **Step 1: Add enums**

Add these enums to `prisma/schema.prisma`:

```prisma
enum ReviewStatus {
  PENDING
  APPROVED
  REJECTED
}

enum ShareScope {
  PRIVATE
  QUESTION_AUTHOR_ONLY
  GROUP_ONLY
  PUBLIC_AUTHORIZED
}

enum IdentityKind {
  QUESTIONER
  LECTURER
  EXPLORER
}

enum ProjectType {
  FREE
  PAID
}
```

- [ ] **Step 2: Extend Question and Answer**

Update `Question` with:

```prisma
  suggestedTitle String?
  confusionType  String?
  heatCount      Int          @default(0)
  shareScope     ShareScope   @default(PRIVATE)
  reviewStatus   ReviewStatus @default(PENDING)
  claimedAt      DateTime?
  claimExpiresAt DateTime?
```

Update `Answer` with:

```prisma
  clarityTags  String[]
  shareScope   ShareScope   @default(PRIVATE)
  reviewStatus ReviewStatus @default(PENDING)
  coverType    String?
```

- [ ] **Step 3: Extend Project**

Update `Project` with:

```prisma
  projectType  ProjectType @default(FREE)
  knowledgeTags String[]
  unlockRule    String?
  groupSizeMin  Int @default(3)
  groupSizeMax  Int @default(5)
  validUntil    DateTime?
```

- [ ] **Step 4: Add IdentityProgress, AbilityTagLog, ShareAsset, ExportLog**

Add:

```prisma
model IdentityProgress {
  id        String       @id @default(cuid())
  kind      IdentityKind
  stars     Int          @default(0)
  litAt     DateTime?
  updatedAt DateTime     @updatedAt
  userId    String
  user      User         @relation(fields: [userId], references: [id])

  @@unique([userId, kind])
  @@map("identity_progress")
}

model AbilityTagLog {
  id        String   @id @default(cuid())
  tag       String
  context   String
  createdAt DateTime @default(now())
  userId    String
  teacherId String
  user      User     @relation("AbilityTagUser", fields: [userId], references: [id])
  teacher   User     @relation("AbilityTagTeacher", fields: [teacherId], references: [id])

  @@map("ability_tag_logs")
}

model ShareAsset {
  id          String      @id @default(cuid())
  assetType   String
  title       String
  imageUrl    String?
  targetUrl   String?
  reviewStatus ReviewStatus @default(PENDING)
  shareScope  ShareScope    @default(PRIVATE)
  createdAt   DateTime      @default(now())
  ownerId      String
  owner        User         @relation(fields: [ownerId], references: [id])

  @@map("share_assets")
}

model ExportLog {
  id        String   @id @default(cuid())
  action    String
  scope     String
  createdAt DateTime @default(now())
  adminId   String
  admin     User     @relation(fields: [adminId], references: [id])

  @@map("export_logs")
}
```

Also add relation arrays to `User` for the new models.

- [ ] **Step 5: Validate**

```bash
npx prisma validate
```

Expected: schema is valid. If relation names conflict, add explicit relation names consistently.

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/seed-data.sql
git commit -m "feat: extend schema for MVP learning flows"
```

---

### Task 4: Homepage V1 Implementation

**Files:**
- Modify: `app/page.tsx`
- Modify: `components/navbar.tsx`
- Modify: `app/globals.css`
- Test: `npm run build`

- [ ] **Step 1: Replace outdated homepage copy**

In `app/page.tsx`, replace旧称 and outdated promises:

```ts
// must not appear anywhere in app/page.tsx
"项目官"
"24h 内回复"
"被采纳赚积分"
```

Use:

```ts
"探索家"
"认领后 72 小时内上传讲解"
"讲清楚，也是在帮助别人理解"
```

- [ ] **Step 2: Use constants from product-copy**

Import:

```tsx
import { SITE, PUBLIC_IDENTITIES, WARM_COPY } from "@/lib/product-copy";
```

Use `SITE.heroTitle`, `SITE.primaryCta`, and `SITE.secondaryCta` for the first screen.

- [ ] **Step 3: Build and visually inspect**

```bash
npm run build
npm run dev
```

Open homepage and verify:
- title is “让一个好问题，长成一片数学森林”;
- CTA pair is “我要提问 / 看孩子如何成长”;
- no top-level “我要讲题” CTA in first screen;
- no ranking or point-total language.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/globals.css components/navbar.tsx
git commit -m "feat: implement approved homepage direction"
```

---

### Task 5: Public Sharing Rules and Outcome Cards

**Files:**
- Create: `lib/share-rules.ts`
- Create: `components/share/share-poster-card.tsx`
- Create: `components/share/poster-scenes.tsx`
- Modify: `app/hall/page.tsx`
- Modify: `app/api/hall/route.ts`
- Test: `npm run build`

- [ ] **Step 1: Add share rule helpers**

Create `lib/share-rules.ts`:

```ts
export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ShareScope = "PRIVATE" | "QUESTION_AUTHOR_ONLY" | "GROUP_ONLY" | "PUBLIC_AUTHORIZED";

export function canShowPublicly(reviewStatus: ReviewStatus, shareScope: ShareScope) {
  return reviewStatus === "APPROVED" && shareScope === "PUBLIC_AUTHORIZED";
}

export const forbiddenPublicWords = ["Top", "第一名", "超过多少人", "排行榜", "公开积分"] as const;
```

- [ ] **Step 2: Create poster scene metadata**

Create `components/share/poster-scenes.tsx`:

```tsx
export const posterSceneCopy = {
  question: { badge: "问题发芽", title: "我提出了一个好问题", hint: "扫码看问题长大" },
  answer: { badge: "讲解长高", title: "我把这个方法讲清楚了", hint: "扫码看讲解" },
  project: { badge: "项目成林", title: "我们一起完成了一个项目", hint: "扫码看成果" },
} as const;
```

- [ ] **Step 3: Create share poster card**

Create `components/share/share-poster-card.tsx`:

```tsx
import { SITE } from "@/lib/product-copy";
import { posterSceneCopy } from "./poster-scenes";

type PosterType = keyof typeof posterSceneCopy;

export function SharePosterCard({ type, title, subtitle }: { type: PosterType; title: string; subtitle: string }) {
  const scene = posterSceneCopy[type];
  return (
    <article className="relative overflow-hidden rounded-[32px] border border-[#184638]/10 bg-[#fffdf3] p-6 shadow-[0_20px_60px_rgba(24,70,56,.18)]">
      <div className="mb-10 flex items-center justify-between gap-4">
        <span className="text-sm font-black text-[#184638]">{SITE.name}</span>
        <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-black text-[#2f8f67]">{scene.badge}</span>
      </div>
      <h3 className="relative z-10 text-3xl font-black leading-tight tracking-[-0.05em] text-[#14352b]">{scene.title}</h3>
      <p className="relative z-10 mt-3 text-sm font-bold leading-relaxed text-[#49675c]">{subtitle}</p>
      <div className="relative z-10 mt-8 rounded-[24px] border border-[#184638]/10 bg-white/90 p-4">
        <strong className="block text-lg leading-snug text-[#14352b]">{title}</strong>
      </div>
      <footer className="relative z-10 mt-8 flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-black text-[#184638]">{SITE.slogan}</div>
          <div className="mt-1 text-xs font-bold text-[#49675c]">{scene.hint}</div>
        </div>
        <div className="h-14 w-14 rounded-2xl border border-[#184638]/10 bg-white" aria-label="二维码占位" />
      </footer>
    </article>
  );
}
```

- [ ] **Step 4: Filter hall API by public rule**

In `app/api/hall/route.ts`, ensure returned items satisfy:

```ts
reviewStatus: "APPROVED",
shareScope: "PUBLIC_AUTHORIZED",
```

Expected: pending/private/group-only content never appears in public hall.

- [ ] **Step 5: Build and commit**

```bash
npm run build
git add lib/share-rules.ts components/share app/hall/page.tsx app/api/hall/route.ts
git commit -m "feat: add public share cards and visibility rules"
```

---

### Task 6: Q&A Claim Window and Review Boundary

**Files:**
- Modify: `app/api/questions/[id]/claim/route.ts`
- Modify: `app/api/questions/route.ts`
- Modify: `app/qa/ask/page.tsx`
- Modify: `app/qa/question/[id]/page.tsx`
- Test: `npm run build`

- [ ] **Step 1: Set claim expiry when a question is claimed**

In claim route, set:

```ts
const claimExpiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000);
```

Persist `claimedAt` and `claimExpiresAt` with status `CLAIMED`.

- [ ] **Step 2: Add low-grade ask fields**

In ask page, include fields for:
- image upload placeholder;
- suggested title;
- confusion type;
- parent/child confirmation copy.

Use copy:

```ts
"可以先拍照上传题目，再用一句话说说卡在哪里。"
"标题可以由系统先建议，最后由你和家长确认。"
```

- [ ] **Step 3: Guard public display**

Question detail should show pending/private answer content only to authorized participants and teachers. Public users only see approved authorized content.

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add app/api/questions app/qa
git commit -m "feat: implement qna claim and review boundaries"
```

---

### Task 7: Project Camp MVP Rules

**Files:**
- Modify: `app/projects/page.tsx`
- Modify: `app/projects/[id]/page.tsx`
- Modify: `app/groups/[id]/page.tsx`
- Modify: `app/api/projects/[id]/register/route.ts`
- Test: `npm run build`

- [ ] **Step 1: Show project card rules**

Each project card must show:

```ts
knowledgeTags
unlockRule
groupingStatus
validUntil
projectType
```

Use private points only as internal readiness; never public rank.

- [ ] **Step 2: Add registration intent fields**

Paid project registration should capture parent contact and intent before or alongside payment:

```ts
parentName
parentPhone
childGrade
intentNote
```

- [ ] **Step 3: Add async collaboration hints**

Group page must include system rhythm copy:

```ts
"今天先留下你的观察，明天再看同伴怎么想。"
"有事可以请假；无故退出会影响后续体验项目机会。"
```

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add app/projects app/groups app/api/projects
git commit -m "feat: implement project camp MVP rules"
```

---

### Task 8: Profile Growth Passport

**Files:**
- Modify: `app/profile/page.tsx`
- Modify: `app/api/user/profile/route.ts`
- Test: `npm run build`

- [ ] **Step 1: Render three public identities**

Profile should render:
- 提问者
- 小讲师
- 探索家

Each identity has grey/unlit or lit state and 1–3 stars.

- [ ] **Step 2: Keep ability badges private**

Ability badges appear only inside personal growth passport, never public hall cards.

- [ ] **Step 3: Add “我的影响力” without ranking**

Show:
- helped questions count;
- thank-you count;
- invite QR placeholder;
- no ranking, no “超过多少人”.

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add app/profile app/api/user/profile/route.ts
git commit -m "feat: add growth passport profile"
```

---

### Task 9: Teacher/Admin Role Separation

**Files:**
- Modify: `app/teacher/page.tsx`
- Modify: `app/api/teacher/*`
- Create: `app/admin/page.tsx`
- Create: `app/api/admin/export/route.ts`
- Create: `app/api/admin/assets/route.ts`
- Test: `npm run build`

- [ ] **Step 1: Teacher scope**

Teacher UI supports:
- review questions/answers/project outcomes;
- add ability tags;
- manage assigned projects;
- no global export.

- [ ] **Step 2: Admin scope**

Admin UI supports:
- data asset overview;
- export/download with log;
- AI project draft publish workflow placeholder;
- user role management.

- [ ] **Step 3: Export route writes ExportLog**

`app/api/admin/export/route.ts` must create an `ExportLog` row before returning export data.

- [ ] **Step 4: Build and commit**

```bash
npm run build
git add app/teacher app/admin app/api/teacher app/api/admin
git commit -m "feat: separate teacher and admin operations"
```

---

### Task 10: Final Verification Report

**Files:**
- Create: `docs/阶段4-MVP代码实施验收报告-V0.md`
- Test: `npm run build`

- [ ] **Step 1: Run build**

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 2: Manual smoke checklist**

Verify:
- Homepage desktop/mobile readable.
- Guest can browse public pages.
- Protected actions trigger login.
- Q&A claim window is 72 hours.
- Public hall shows only approved + public authorized content.
- No public ranking/point-total language.
- Teacher routes reject students.
- Admin export logs actions.

- [ ] **Step 3: Write report**

Create `docs/阶段4-MVP代码实施验收报告-V0.md` with:

```md
# 阶段4-MVP代码实施验收报告 V0

## 构建结果

- `npm run build`: PASS/FAIL

## 已完成

- [ ] 首页 V1 实装
- [ ] 你问我答闭环
- [ ] 项目营闭环
- [ ] 成果广场公开边界
- [ ] 个人中心成长护照
- [ ] 老师/管理员权限分离

## 未完成 / P1 后置

- 列出未完成项。

## 线上验证

- 访问地址：
- 验证时间：
- 验证结论：
```

- [ ] **Step 4: Commit**

```bash
git add docs/阶段4-MVP代码实施验收报告-V0.md
git commit -m "docs: add MVP implementation verification report"
```
