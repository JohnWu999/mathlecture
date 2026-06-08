import { WARM_MICROCOPY } from "@/lib/product-copy";
import { colors, fonts, handDrawn } from "@/lib/visual-tokens";

export function InternalTestBanner() {
  return (
    <div
      className="relative z-20 mx-auto mt-4 flex w-[92%] max-w-5xl flex-col items-start gap-2 px-4 py-3 text-left md:flex-row md:items-center md:justify-between"
      style={{
        background: "rgba(255, 248, 234, 0.9)",
        border: `2px dashed ${colors.border}`,
        borderRadius: handDrawn.softCardRadius,
        boxShadow: "0 10px 24px rgba(33, 72, 58, 0.08)",
      }}
      role="note"
      aria-label="内部测试版本提示"
    >
      <div>
        <span
          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold"
          style={{
            background: "rgba(255, 209, 102, 0.55)",
            color: colors.ink,
            border: `1px solid ${colors.border}`,
            fontFamily: fonts.body,
          }}
        >
          内部测试版｜功能入口正在验收
        </span>
        <p className="mt-2 text-sm" style={{ color: colors.inkLight, fontFamily: fonts.body }}>
          当前用于团队内测：请重点检查入口、按钮、身份路径和后台追踪；未完成能力会明确标注，不把占位当完成。
        </p>
      </div>
      <div className="text-xs md:text-right" style={{ color: colors.muted, fontFamily: fonts.body }}>
        {WARM_MICROCOPY.ask} · {WARM_MICROCOPY.explain}
      </div>
    </div>
  );
}
