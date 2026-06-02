"use client";

import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { HOME_ACTIONS, PUBLIC_IDENTITIES, SITE, TRUST_ITEMS } from "@/lib/product-copy";
import { growthMotifs } from "@/components/brand/growth-motifs";
import { colors, fonts, handDrawn, identityColors, mathDoodles, motionTokens } from "@/lib/visual-tokens";

/* ============================================================
   阶段数据
   ============================================================ */

const stages = PUBLIC_IDENTITIES.map((identity, index) => ({
  status: (["done", "current", "todo"] as const)[index],
  emoji: identity.emoji,
  role: identity.label,
  cta: identity.cta,
  detail: identity.detail,
  stickyColor: identityColors[identity.key],
  rotate: motionTokens.gentleRotations[index],
  Plant: growthMotifs[identity.key],
  plantStyle: motionTokens.plantTransforms[index],
}));

const trustItems = TRUST_ITEMS.map((item) => ({
  ...item,
  iconBg: identityColors[item.colorKey],
}));

/* ============================================================
   首页组件
   ============================================================ */

export default function HomePage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);

  const toggleStage = (index: number) => {
    setExpandedStage(expandedStage === index ? null : index);
  };

  return (
    <main className="min-h-screen relative">
      {/* 涂鸦符号层 */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {mathDoodles.map((doodle, index) => (
          <span
            key={`${doodle.symbol}-${index}`}
            className={`absolute ${doodle.className}`}
            style={{ color: colors.border }}
          >
            {doodle.symbol}
          </span>
        ))}
      </div>

      <Navbar />

      {/* ==================== 首屏核心区 ==================== */}
      <section className="relative z-10 px-4 pt-20 pb-20 text-center">
        {/* ① 品牌标题区 */}
        <h1
          className="text-[40px] leading-tight"
          style={{ fontFamily: fonts.title, color: colors.ink }}
        >
          {SITE.name}
        </h1>
        <p
          className="mt-3 text-[12px]"
          style={{ fontFamily: fonts.body, color: colors.muted }}
        >
          {SITE.audience}
        </p>

        {/* ② 身份进阶路径图 */}
        <div className="mt-20 mx-auto w-[90%] max-w-[400px] md:max-w-[720px]">
          {/* 移动端：纵向排列 */}
          <div className="home-desktop-hidden flex-col relative flex items-start gap-8">
            {/* 左侧竖线 */}
            <div style={{
              position: "absolute",
              left: "15px",
              top: "12px",
              bottom: "12px",
              width: "2px",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='2' height='20' viewBox='0 0 2 20'%3E%3Cpath d='M1 0 Q1.5 5 1 10 T1 20' fill='none' stroke='%238D6E63' stroke-width='2' stroke-dasharray='3,4' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: "repeat-y",
              backgroundSize: "2px 20px",
            }} />

            {stages.map((stage, index) => {
              const Plant = stage.Plant;
              const isCurrent = stage.status === "current";
              return (
                <div key={index} className="flex items-start gap-4 relative w-full">
                  {/* 植物节点 */}
                  <div className="w-8 flex justify-center shrink-0 relative z-20">
                    <div style={isCurrent ? motionTokens.currentPlantTransform : stage.plantStyle}>
                      <Plant isCurrent={isCurrent} />
                    </div>
                  </div>

                  {/* 便利贴卡片 */}
                  <div
                    className={`sticky-note flex-1 relative cursor-pointer ${isCurrent ? "current" : ""}`}
                    style={{
                      background: stage.stickyColor,
                      transform: isCurrent
                        ? "rotate(1deg) translateY(-20px)"
                        : `rotate(${stage.rotate}deg)`,
                      ...(isCurrent ? { border: `3px solid ${colors.border}` } : {}),
                    }}
                    onClick={() => toggleStage(index)}
                  >
                    <div className="text-2xl text-center">{stage.emoji}</div>
                    <div
                      className="text-center mt-2 text-base"
                      style={{ fontFamily: fonts.title, color: colors.ink }}
                    >
                      {stage.role}
                    </div>
                    <div
                      className="text-center mt-1 text-[13px]"
                      style={{ fontFamily: fonts.body, color: colors.inkLight }}
                    >
                      {stage.cta}
                    </div>
                  </div>

                  {/* 展开内容 */}
                  {expandedStage === index && (
                    <div
                      className="ml-12 w-full text-[13px] leading-relaxed"
                      style={{
                        fontFamily: fonts.body,
                        color: colors.inkLight,
                        background: colors.paper,
                        border: "2px dashed rgba(141,110,99,0.35)",
                        padding: "16px",
                        borderRadius: handDrawn.softCardRadius,
                        marginTop: "8px",
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      {stage.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 桌面端：横向排列 */}
          <div className="home-desktop-flex relative items-start justify-center gap-10">
            {/* 下方横线 */}
            <div style={{
              position: "absolute",
              left: "40px",
              right: "40px",
              bottom: "15px",
              height: "4px",
              backgroundImage: handDrawn.wavyLineDataUrl,
              backgroundRepeat: "repeat-x",
              backgroundSize: "40px 4px",
            }} />

            {/* 植物间淡淡铅笔虚线连接 */}
            <div className="absolute left-[22%] right-[22%] z-10" style={{ top: "22px", height: "2px" }}>
              <svg width="100%" height="4" preserveAspectRatio="none">
                <line x1="0" y1="2" x2="100%" y2="2" stroke={colors.border} strokeWidth="1" strokeDasharray="4,6" opacity="0.25" strokeLinecap="round" />
              </svg>
            </div>

            {stages.map((stage, index) => {
              const Plant = stage.Plant;
              const isCurrent = stage.status === "current";
              return (
                <div key={index} className="flex flex-col items-center flex-1 max-w-[200px] relative">
                  {/* 植物节点 - 在横线上方 */}
                  <div className="h-12 flex items-end justify-center relative z-20 mb-2">
                    <div style={isCurrent ? motionTokens.currentPlantTransform : stage.plantStyle}>
                      <Plant isCurrent={isCurrent} />
                    </div>
                  </div>

                  {/* 便利贴卡片 */}
                  <div
                    className={`sticky-note w-full relative cursor-pointer ${isCurrent ? "current" : ""}`}
                    style={{
                      background: stage.stickyColor,
                      transform: isCurrent
                        ? "rotate(1deg) translateY(-20px)"
                        : `rotate(${stage.rotate}deg)`,
                      ...(isCurrent ? { border: `3px solid ${colors.border}` } : {}),
                    }}
                    onClick={() => toggleStage(index)}
                  >
                    <div className="text-2xl text-center">{stage.emoji}</div>
                    <div
                      className="text-center mt-2 text-base"
                      style={{ fontFamily: fonts.title, color: colors.ink }}
                    >
                      {stage.role}
                    </div>
                    <div
                      className="text-center mt-1 text-[13px]"
                      style={{ fontFamily: fonts.body, color: colors.inkLight }}
                    >
                      {stage.cta}
                    </div>
                  </div>

                  {/* 展开内容 */}
                  {expandedStage === index && (
                    <div
                      className="mt-3 w-full text-[13px] leading-relaxed"
                      style={{
                        fontFamily: fonts.body,
                        color: colors.inkLight,
                        background: colors.paper,
                        border: "2px dashed rgba(141,110,99,0.35)",
                        padding: "16px",
                        borderRadius: handDrawn.softCardRadius,
                        animation: "fadeIn 0.3s ease",
                      }}
                    >
                      {stage.detail}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 板块间箭头：路径图 → 分流按钮（实际方向是向下） */}
        <div className="mt-10 flex justify-center">
          <div className="flex flex-col items-center gap-1" style={{ opacity: 0.75 }}>
            <svg width="28" height="28" viewBox="0 0 20 20">
              <path d="M10 2 L10 14 M6 10 L10 14 L14 10" fill="none" stroke={colors.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,3" />
            </svg>
            <span className="text-xs" style={{ fontFamily: fonts.title, color: colors.muted }}>{HOME_ACTIONS.flowHints[0]}</span>
          </div>
        </div>

        {/* ③ 分流按钮区 */}
        <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
          <Link
            href={HOME_ACTIONS.primary.href}
            className="btn-hand btn-yellow w-full md:w-[240px] text-center"
            style={{
              padding: "14px 0",
              fontSize: "16px",
              fontFamily: fonts.title,
              transform: "rotate(-1deg)",
            }}
          >
            {HOME_ACTIONS.primary.label}
          </Link>
          <Link
            href={HOME_ACTIONS.secondary.href}
            className="btn-hand btn-green w-full md:w-[240px] text-center"
            style={{
              padding: "14px 0",
              fontSize: "16px",
              fontFamily: fonts.title,
              transform: "rotate(2deg)",
              marginTop: "20px",
            }}
          >
            {HOME_ACTIONS.secondary.label}
          </Link>
        </div>
        <p
          className="mt-4 text-[13px]"
          style={{ fontFamily: fonts.body, color: colors.muted }}
        >
          {HOME_ACTIONS.account.login}
          <Link href="/login" className="text-[#3E2723] hover:underline">
            {HOME_ACTIONS.account.loginLabel}
          </Link>
          · {HOME_ACTIONS.account.register}
          <Link href="/register" className="text-[#3E2723] hover:underline">
            {HOME_ACTIONS.account.registerLabel}
          </Link>
        </p>
      </section>

      {/* 板块间箭头：路径图 → 信任背书 */}
      <div className="relative z-10 flex justify-center py-4">
        <div className="flex flex-col items-center gap-1" style={{ opacity: 0.75 }}>
          <svg width="28" height="28" viewBox="0 0 20 20">
            <path d="M10 2 L10 14 M6 10 L10 14 L14 10" fill="none" stroke={colors.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,3" />
          </svg>
          <span className="text-xs" style={{ fontFamily: fonts.title, color: colors.muted }}>{HOME_ACTIONS.flowHints[1]}</span>
        </div>
      </div>

      {/* ==================== 信任背书区 ==================== */}
      <section className="relative z-10 px-4 pt-20 pb-10 text-center">
        <h2
          className="text-xl"
          style={{ fontFamily: fonts.title, color: colors.ink }}
        >
          家长最关心的三件事
        </h2>

        <div className="home-desktop-grid-3 grid grid-cols-1 gap-6 md:gap-8 max-w-4xl mx-auto mt-12">
          {trustItems.map((item, index) => {
            const rotations = [-2, 1, -1];
            return (
              <div
                key={index}
                className="flex flex-col items-center relative"
                style={{
                  background: item.iconBg,
                  border: `2px solid ${colors.border}`,
                  borderRadius: "2px 255px 3px 255px / 255px 3px 255px 2px",
                  padding: "32px 24px",
                  transform: `rotate(${rotations[index]}deg)`,
                }}
              >
                {/* ∞ 符号串联（桌面端） */}
                {index < 2 && (
                  <div className="home-desktop-flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center">
                    <span style={{ fontSize: "28px", color: colors.muted, opacity: 0.5, fontFamily: "'Noto Sans SC', sans-serif" }}>∞</span>
                  </div>
                )}

                {/* 图标 32px */}
                <div className="text-[32px] leading-none">{item.icon}</div>

                <h3
                  className="mt-4 text-[15px]"
                  style={{ fontFamily: fonts.title, color: colors.ink }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2 text-[13px] leading-[1.6] max-w-[280px]"
                  style={{ fontFamily: fonts.body, color: colors.inkLight }}
                >
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 板块间箭头：信任背书 → 行动号召 */}
      <div className="relative z-10 flex justify-center py-4">
        <div className="flex flex-col items-center gap-1" style={{ opacity: 0.75 }}>
          <svg width="28" height="28" viewBox="0 0 20 20">
            <path d="M10 2 L10 14 M6 10 L10 14 L14 10" fill="none" stroke={colors.border} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,3" />
          </svg>
          <span className="text-xs" style={{ fontFamily: fonts.title, color: colors.muted }}>{HOME_ACTIONS.flowHints[2]}</span>
        </div>
      </div>

      {/* ==================== 行动号召区 ==================== */}
      <section className="relative z-10 px-4 py-16 text-center">
        <div
          className="mx-auto w-[90%] max-w-[400px] md:max-w-[600px]"
          style={{
            border: `3px dashed ${colors.border}`,
            borderRadius: handDrawn.organicRadius,
            padding: "32px 24px",
            background: "transparent",
          }}
        >
          <h2
            className="text-2xl"
            style={{ fontFamily: fonts.title, color: colors.ink }}
          >
            {HOME_ACTIONS.finalTitle}
          </h2>
          <p
            className="mt-2 text-sm"
            style={{ fontFamily: fonts.body, color: colors.muted }}
          >
            {HOME_ACTIONS.finalSubtitle}
          </p>

          <Link
            href="/register"
            className="btn-hand mt-6 inline-flex items-center justify-center"
            style={{
              padding: "12px 36px",
              fontSize: "16px",
              whiteSpace: "nowrap",
              fontFamily: fonts.title,
              background: "transparent",
              color: colors.ink,
              border: `3px solid ${colors.border}`,
              borderRadius: handDrawn.organicRadius,
              position: "relative",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#FFF9C4";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "transparent";
            }}
          >
            {HOME_ACTIONS.finalCta}
          </Link>
        </div>
      </section>

      {/* 页面底部数学装饰 */}
      <div className="relative z-0" aria-hidden="true">
        <div style={{ position: "absolute", bottom: "80px", left: "5%", fontSize: "48px", color: colors.muted, opacity: 0.08, fontFamily: fonts.title, transform: "rotate(-15deg)" }}>
          +</div>
        <div style={{ position: "absolute", bottom: "120px", right: "8%", fontSize: "40px", color: colors.muted, opacity: 0.08, fontFamily: fonts.title, transform: "rotate(10deg)" }}>
          ×</div>
        <div style={{ position: "absolute", bottom: "60px", right: "20%", fontSize: "36px", color: colors.muted, opacity: 0.06, fontFamily: fonts.title, transform: "rotate(-8deg)" }}>
          =</div>
        <div style={{ position: "absolute", bottom: "140px", left: "15%", fontSize: "32px", color: colors.muted, opacity: 0.07, fontFamily: fonts.title, transform: "rotate(20deg)" }}>
          ∞</div>
        <div style={{ position: "absolute", bottom: "40px", left: "40%", fontSize: "28px", color: colors.muted, opacity: 0.05, fontFamily: fonts.title, transform: "rotate(-5deg)" }}>
          π</div>
      </div>

      {/* fadeIn 动画 */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}
