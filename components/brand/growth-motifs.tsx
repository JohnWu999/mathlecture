import { colors } from "@/lib/visual-tokens";

type SvgProps = { className?: string; isCurrent?: boolean };

export function SproutMotif({ className = "" }: SvgProps) {
  return (
    <svg width="32" height="36" viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M20 38 Q21.5 28 19.5 18 Q18.5 12 20 8" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
      <path d="M20 8 Q13 4 11.5 10.5 Q14 14.5 20 8" fill="#E8F5E9" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
      <path d="M20 8 Q27 3 28.5 9.5 Q26 13.5 20 8" fill="#E8F5E9" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
      <path d="M20 8 Q17.5 2 20 0.5 Q22.5 2 20 8" fill="#E8F5E9" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
    </svg>
  );
}

export function TreeMotif({ className = "", isCurrent = false }: SvgProps) {
  const sw = isCurrent ? 3 : 2;
  const branchSw = isCurrent ? 2 : 1.5;
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" className={className} aria-hidden="true">
      <path d="M20 50 L20 16" fill="none" stroke={colors.border} strokeWidth={sw} strokeLinecap="round" />
      <path d="M20 32 L13 26" fill="none" stroke={colors.border} strokeWidth={branchSw} strokeLinecap="round" />
      <path d="M20 28 L27 22" fill="none" stroke={colors.border} strokeWidth={branchSw} strokeLinecap="round" />
      <circle cx="20" cy="14" r="11" fill="#C8E6C9" fillOpacity="0.5" stroke={colors.border} strokeWidth={sw} />
      <circle cx="11" cy="18" r="7" fill="#C8E6C9" fillOpacity="0.4" stroke={colors.border} strokeWidth={branchSw} />
      <circle cx="29" cy="18" r="7" fill="#C8E6C9" fillOpacity="0.4" stroke={colors.border} strokeWidth={branchSw} />
    </svg>
  );
}

export function ForestMotif({ className = "" }: SvgProps) {
  return (
    <svg width="60" height="52" viewBox="0 0 70 55" className={className} aria-hidden="true">
      <path d="M15 50 L15 32" fill="none" stroke={colors.border} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M15 32 Q8 24 10.5 17 Q12.5 10 15 14 Q17.5 10 19.5 17 Q22 24 15 32" fill="#A5D6A7" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
      <path d="M35 50 L35 15" fill="none" stroke={colors.border} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M35 15 Q25 8 28.5 1 Q32 -2 35 3 Q38 -2 41.5 1 Q45 8 35 15" fill="#A5D6A7" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
      <path d="M55 50 L55 32" fill="none" stroke={colors.border} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M55 32 Q48 24 50.5 17 Q52.5 10 55 14 Q57.5 10 59.5 17 Q62 24 55 32" fill="#A5D6A7" stroke={colors.border} strokeWidth="1.5" opacity="0.5" />
      <path d="M5 50 Q20 51.5 35 50 Q50 48.5 65 50" fill="none" stroke={colors.border} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export const growthMotifs = {
  questioner: SproutMotif,
  lecturer: TreeMotif,
  explorer: ForestMotif,
} as const;
