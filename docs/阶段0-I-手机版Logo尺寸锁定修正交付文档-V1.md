# 阶段0-I｜手机版 Logo 实际尺寸锁定修正交付文档 V1

时间：2026-06-08 22:50 CST  
线上地址：http://159.75.144.28/math-young-lecturer

## 1. 用户反馈

犟爸指出：Logo 图标尺寸不对，手机版看起来反而更大了。

## 2. 判断

反馈成立。上一轮虽然把手机端 CSS 写成 `24px × 16px`，但只设置了 `width/height`，没有同时锁定 `max-width/max-height/flex`。在移动端 WebView / flex 布局里，SVG 仍可能被父级布局或默认 SVG 行内行为影响，视觉上显得偏大。

## 3. 修正

本次只修手机端 Logo 尺寸，不改业务逻辑。

在 `components/navbar.tsx` 的 `@media (max-width: 620px)` 下，将 Logo SVG 从：

- `24px × 16px`

进一步调整并锁定为：

- `width: 18px`
- `height: 12px`
- `max-width: 18px`
- `max-height: 12px`
- `flex: 0 0 18px`
- `display: block`

这样不是只“声明一个宽高”，而是把实际渲染外框也锁住，避免手机端看起来被撑大。

## 4. 测试

更新测试：

- `tests/stage0h-profile-mobile-nav-rules.test.mjs`
- `tests/stage0f-background-nav-cleanup-rules.test.mjs`

新增/更新规则：

1. 手机端 Logo 必须是 `18px × 12px`；
2. 必须有 `max-width: 18px` 与 `max-height: 12px`；
3. 必须有 `flex: 0 0 18px`，避免在品牌区域中被拉伸。

验证通过：

```bash
node --test tests/stage0h-profile-mobile-nav-rules.test.mjs
node --test tests/stage0f-background-nav-cleanup-rules.test.mjs
npm run build
```

## 5. 部署与线上验证

代码提交：

- `290bab6 stage0i: lock down mobile logo size`

线上已部署并重启 PM2：

- PM2 应用：`math-young-lecturer`
- 状态：online
- unstable restarts：0

线上验证：

- `/`：200
- `/profile`：200
- `/qa`：200
- 页面无重复 basePath
- 构建产物已确认包含：
  - `width:18px;height:12px`
  - `max-width:18px;max-height:12px`
  - `flex: 0 0 18px`
  - `display:block`

## 6. 边界

本轮只修手机端 Logo 实际尺寸锁定，不改导航入口、不改页面结构、不改业务闭环。
