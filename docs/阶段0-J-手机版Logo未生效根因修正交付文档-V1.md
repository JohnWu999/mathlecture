# 阶段0-J｜手机版 Logo 未生效根因修正交付文档 V1

时间：2026-06-08 23:08 CST  
线上地址：http://159.75.144.28/math-young-lecturer

## 1. 用户反馈

犟爸指出：手机版 Logo 还是没有改过来。

## 2. 根因

反馈成立。阶段0-I 的判断仍不完整。

真正原因不是单纯尺寸数值，也不只是缓存，而是 styled-jsx 作用域选择器没有真正命中 `LogoMark` 子组件里的 SVG。

原先编译后的选择器类似：

```css
.forest-brand.jsx-xxxx svg.jsx-xxxx { ... }
```

但 `LogoMark()` 是子组件，里面的 `<svg>` 没有父组件 styled-jsx 自动加上的 `jsx-xxxx` class，因此这条规则在真实 DOM 上不会稳定命中。结果就是：源码里虽然写了 `18px × 12px`，但手机端看到的实际 Logo 仍可能沿用旧尺寸或被原始 SVG 视口撑大。

## 3. 修正

本轮改为显式给 Logo SVG 加稳定 class：

```tsx
<svg className="brand-logo-mark" ...>
```

并将 CSS 改为 styled-jsx 可命中子组件 DOM 的全局目标选择器：

```css
.forest-brand :global(.brand-logo-mark) { ... }
```

手机端尺寸进一步缩小并锁定为：

- `width: 14px`
- `height: 9px`
- `max-width: 14px`
- `max-height: 9px`
- `flex: 0 0 14px`
- `display: block`

## 4. 测试

更新测试：

- `tests/stage0h-profile-mobile-nav-rules.test.mjs`
- `tests/stage0f-background-nav-cleanup-rules.test.mjs`

新增/更新规则：

1. Logo SVG 必须带 `className="brand-logo-mark"`；
2. 手机端 Logo CSS 必须使用 `.forest-brand :global(.brand-logo-mark)`；
3. 手机端 Logo 必须锁定为 `14px × 9px`；
4. 必须锁定 `max-width/max-height/flex`。

验证通过：

```bash
node --test tests/stage0h-profile-mobile-nav-rules.test.mjs
node --test tests/stage0f-background-nav-cleanup-rules.test.mjs
npm run build
```

## 5. 部署与线上验证

代码提交：

- `deccb49 stage0j: target mobile logo svg globally`

线上已部署并重启 PM2：

- PM2 应用：`math-young-lecturer`
- 状态：online
- unstable restarts：0

线上验证：

- `/`：200
- `/profile`：200
- `/qa`：200
- 页面 HTML 已包含 `brand-logo-mark`
- 无重复 basePath
- 构建产物已确认包含编译后的真实命中选择器：

```css
.forest-brand.jsx-... .brand-logo-mark {
  width: 14px;
  height: 9px;
  max-width: 14px;
  max-height: 9px;
  flex: 0 0 14px;
  display: block;
}
```

## 6. 边界

本轮只修 Logo 实际命中与尺寸，不改导航入口、不改页面结构、不改业务闭环。

若手机仍显示旧尺寸，优先判断为手机浏览器缓存或 WebView 资源缓存；但本轮线上 HTML 与构建产物已确认新 class 与新尺寸规则存在。
