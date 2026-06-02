import { colors, fonts } from "@/lib/visual-tokens";

export function FlowArrow({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-1" style={{ opacity: 0.75 }}>
      <svg width="28" height="28" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M10 2 L10 14 M6 10 L10 14 L14 10"
          fill="none"
          stroke={colors.border}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3,3"
        />
      </svg>
      <span className="text-xs" style={{ fontFamily: fonts.title, color: colors.muted }}>
        {label}
      </span>
    </div>
  );
}
