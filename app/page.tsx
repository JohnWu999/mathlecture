"use client";

import Link from "next/link";
import type { ComponentType, CSSProperties } from "react";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { growthMotifs } from "@/components/brand/growth-motifs";
import { FlowArrow } from "@/components/home/flow-arrow";
import { TrustCard } from "@/components/home/trust-card";
import { HOME_ACTIONS, PUBLIC_IDENTITIES, SITE, TRUST_ITEMS } from "@/lib/product-copy";
import {
  bottomMathDoodles,
  colors,
  fonts,
  handDrawn,
  identityColors,
  mathDoodles,
  motionTokens,
} from "@/lib/visual-tokens";

type GrowthMotif = ComponentType<{ className?: string; isCurrent?: boolean }>;

type Stage = {
  status: "done" | "current" | "todo";
  emoji: string;
  role: string;
  cta: string;
  detail: string;
  stickyColor: string;
  rotate: number;
  Plant: GrowthMotif;
  plantStyle: CSSProperties;
};

const stages: Stage[] = PUBLIC_IDENTITIES.map((identity, index) => ({
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

function MathDoodleLayer() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
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
  );
}

function MobilePathLine() {
  return (
    <div
      style={{
        position: "absolute",
        left: "15px",
        top: "12px",
        bottom: "12px",
        width: "2px",
        backgroundImage: handDrawn.verticalWavyLineDataUrl,
        backgroundRepeat: "repeat-y",
        backgroundSize: "2px 20px",
      }}
      aria-hidden="true"
    />
  );
}

function DesktopPathLine() {
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: "40px",
          right: "40px",
          bottom: "15px",
          height: "4px",
          backgroundImage: handDrawn.wavyLineDataUrl,
          backgroundRepeat: "repeat-x",
          backgroundSize: "40px 4px",
        }}
        aria-hidden="true"
      />
      <div className="absolute left-[22%] right-[22%] z-10" style={{ top: "22px", height: "2px" }} aria-hidden="true">
        <svg width="100%" height="4" preserveAspectRatio="none">
          <line
            x1="0"
            y1="2"
            x2="100%"
            y2="2"
            stroke={colors.border}
            strokeWidth="1"
            strokeDasharray="4,6"
            opacity="0.25"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </>
  );
}

function StageNote({ stage, isCurrent, onClick, compact = false }: { stage: Stage; isCurrent: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <div
      className={`sticky-note ${compact ? "flex-1" : "w-full"} relative cursor-pointer ${isCurrent ? "current" : ""}`}
      style={{
        background: stage.stickyColor,
        transform: isCurrent ? "rotate(1deg) translateY(-20px)" : `rotate(${stage.rotate}deg)`,
        ...(isCurrent ? { border: `3px solid ${colors.border}` } : {}),
      }}
      onClick={onClick}
    >
      <div className="text-2xl text-center">{stage.emoji}</div>
      <div className="text-center mt-2 text-base" style={{ fontFamily: fonts.title, color: colors.ink }}>
        {stage.role}
      </div>
      <div className="text-center mt-1 text-[13px]" style={{ fontFamily: fonts.body, color: colors.inkLight }}>
        {stage.cta}
      </div>
    </div>
  );
}

function StageDetail({ stage, mobile = false }: { stage: Stage; mobile?: boolean }) {
  return (
    <div
      className={`${mobile ? "ml-12" : "mt-3"} w-full text-[13px] leading-relaxed`}
      style={{
        fontFamily: fonts.body,
        color: colors.inkLight,
        background: colors.paper,
        border: handDrawn.dashedPanelBorder,
        padding: "16px",
        borderRadius: handDrawn.softCardRadius,
        ...(mobile ? { marginTop: "8px" } : {}),
        animation: "fadeIn 0.3s ease",
      }}
    >
      {stage.detail}
    </div>
  );
}

function StagePlant({ stage, isCurrent }: { stage: Stage; isCurrent: boolean }) {
  const Plant = stage.Plant;
  return (
    <div style={isCurrent ? motionTokens.currentPlantTransform : stage.plantStyle}>
      <Plant isCurrent={isCurrent} />
    </div>
  );
}

function StagePath({ expandedStage, onToggle }: { expandedStage: number | null; onToggle: (index: number) => void }) {
  return (
    <div className="mt-20 mx-auto w-[90%] max-w-[400px] md:max-w-[720px]">
      <div className="home-desktop-hidden flex-col relative flex items-start gap-8">
        <MobilePathLine />
        {stages.map((stage, index) => {
          const isCurrent = stage.status === "current";
          return (
            <div key={stage.role} className="flex items-start gap-4 relative w-full">
              <div className="w-8 flex justify-center shrink-0 relative z-20">
                <StagePlant stage={stage} isCurrent={isCurrent} />
              </div>
              <StageNote stage={stage} isCurrent={isCurrent} compact onClick={() => onToggle(index)} />
              {expandedStage === index && <StageDetail stage={stage} mobile />}
            </div>
          );
        })}
      </div>

      <div className="home-desktop-flex relative items-start justify-center gap-10">
        <DesktopPathLine />
        {stages.map((stage, index) => {
          const isCurrent = stage.status === "current";
          return (
            <div key={stage.role} className="flex flex-col items-center flex-1 max-w-[200px] relative">
              <div className="h-12 flex items-end justify-center relative z-20 mb-2">
                <StagePlant stage={stage} isCurrent={isCurrent} />
              </div>
              <StageNote stage={stage} isCurrent={isCurrent} onClick={() => onToggle(index)} />
              {expandedStage === index && <StageDetail stage={stage} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HomeActions() {
  return (
    <>
      <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
        <Link
          href={HOME_ACTIONS.primary.href}
          className="btn-hand btn-yellow w-full md:w-[240px] text-center"
          style={{ padding: "14px 0", fontSize: "16px", fontFamily: fonts.title, transform: "rotate(-1deg)" }}
        >
          {HOME_ACTIONS.primary.label}
        </Link>
        <Link
          href={HOME_ACTIONS.secondary.href}
          className="btn-hand btn-green w-full md:w-[240px] text-center"
          style={{ padding: "14px 0", fontSize: "16px", fontFamily: fonts.title, transform: "rotate(2deg)", marginTop: "20px" }}
        >
          {HOME_ACTIONS.secondary.label}
        </Link>
      </div>
      <p className="mt-4 text-[13px]" style={{ fontFamily: fonts.body, color: colors.muted }}>
        {HOME_ACTIONS.account.login}
        <Link href="/login" style={{ color: colors.ink }} className="hover:underline">
          {HOME_ACTIONS.account.loginLabel}
        </Link>
        · {HOME_ACTIONS.account.register}
        <Link href="/register" style={{ color: colors.ink }} className="hover:underline">
          {HOME_ACTIONS.account.registerLabel}
        </Link>
      </p>
    </>
  );
}

function TrustSection() {
  return (
    <section className="relative z-10 px-4 pt-20 pb-10 text-center">
      <h2 className="text-xl" style={{ fontFamily: fonts.title, color: colors.ink }}>
        {HOME_ACTIONS.trustTitle}
      </h2>
      <div className="home-desktop-grid-3 grid grid-cols-1 gap-6 md:gap-8 max-w-4xl mx-auto mt-12">
        {trustItems.map((item, index) => (
          <TrustCard key={item.title} icon={item.icon} title={item.title} desc={item.desc} background={item.iconBg} index={index} />
        ))}
      </div>
    </section>
  );
}

function FinalCta() {
  return (
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
        <h2 className="text-2xl" style={{ fontFamily: fonts.title, color: colors.ink }}>
          {HOME_ACTIONS.finalTitle}
        </h2>
        <p className="mt-2 text-sm" style={{ fontFamily: fonts.body, color: colors.muted }}>
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
            (e.target as HTMLElement).style.background = colors.crayonYellow;
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.background = "transparent";
          }}
        >
          {HOME_ACTIONS.finalCta}
        </Link>
      </div>
    </section>
  );
}

function BottomMathDoodles() {
  return (
    <div className="relative z-0" aria-hidden="true">
      {bottomMathDoodles.map((doodle) => (
        <div
          key={doodle.symbol}
          style={{
            position: "absolute",
            color: colors.muted,
            fontFamily: fonts.title,
            ...doodle.style,
          }}
        >
          {doodle.symbol}
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const toggleStage = (index: number) => setExpandedStage(expandedStage === index ? null : index);

  return (
    <main className="min-h-screen relative">
      <MathDoodleLayer />
      <Navbar />

      <section className="relative z-10 px-4 pt-20 pb-20 text-center">
        <h1 className="text-[40px] leading-tight" style={{ fontFamily: fonts.title, color: colors.ink }}>
          {SITE.name}
        </h1>
        <p className="mt-3 text-[12px]" style={{ fontFamily: fonts.body, color: colors.muted }}>
          {SITE.audience}
        </p>
        <StagePath expandedStage={expandedStage} onToggle={toggleStage} />
        <div className="mt-10 flex justify-center">
          <FlowArrow label={HOME_ACTIONS.flowHints[0]} />
        </div>
        <HomeActions />
      </section>

      <div className="relative z-10 flex justify-center py-4">
        <FlowArrow label={HOME_ACTIONS.flowHints[1]} />
      </div>
      <TrustSection />
      <div className="relative z-10 flex justify-center py-4">
        <FlowArrow label={HOME_ACTIONS.flowHints[2]} />
      </div>
      <FinalCta />
      <BottomMathDoodles />

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
