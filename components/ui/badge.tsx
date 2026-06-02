import type { ReactNode } from "react";
import { colors, fonts, handDrawn } from "@/lib/visual-tokens";

type BadgeTone = "yellow" | "green" | "blue" | "white" | "orange";

const toneBackground: Record<BadgeTone, string> = {
  yellow: colors.crayonYellow,
  green: colors.crayonGreen,
  blue: colors.crayonBlue,
  white: "rgba(255, 255, 255, 0.9)",
  orange: "#FFCC80",
};

export function Badge({ children, tone = "white" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        padding: "5px 12px",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: fonts.body,
        color: colors.ink,
        background: toneBackground[tone],
        border: `1.5px solid ${colors.border}`,
        borderRadius: handDrawn.organicRadius,
      }}
    >
      {children}
    </span>
  );
}
