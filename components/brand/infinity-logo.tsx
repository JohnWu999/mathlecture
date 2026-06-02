import { SITE } from "@/lib/product-copy";
import { colors, fonts, handDrawn } from "@/lib/visual-tokens";

type InfinityLogoProps = {
  showName?: boolean;
  size?: "sm" | "md";
};

export function InfinityLogo({ showName = true, size = "md" }: InfinityLogoProps) {
  const boxSize = size === "sm" ? 32 : 40;
  const symbolSize = size === "sm" ? 14 : 18;
  const nameSize = size === "sm" ? 18 : 20;

  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center"
        aria-hidden="true"
        style={{
          width: boxSize,
          height: boxSize,
          border: `2px solid ${colors.border}`,
          borderRadius: handDrawn.organicRadius,
          transform: "rotate(-3deg)",
        }}
      >
        <span style={{ fontFamily: fonts.title, fontSize: symbolSize, color: colors.ink }}>∞</span>
      </span>
      {showName && (
        <span style={{ fontFamily: fonts.title, fontSize: nameSize, color: colors.ink }}>
          {SITE.name}
        </span>
      )}
    </span>
  );
}
