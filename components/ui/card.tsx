import type { ReactNode } from "react";
import { colors, handDrawn } from "@/lib/visual-tokens";

type CardTone = "paper" | "yellow" | "green" | "blue" | "white";

const toneBackground: Record<CardTone, string> = {
  paper: colors.paper,
  yellow: colors.crayonYellow,
  green: colors.crayonGreen,
  blue: colors.crayonBlue,
  white: "rgba(255, 255, 255, 0.9)",
};

export function Card({
  children,
  tone = "paper",
  className = "",
}: {
  children: ReactNode;
  tone?: CardTone;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: toneBackground[tone],
        border: `2px solid ${colors.border}`,
        borderRadius: handDrawn.organicRadius,
        padding: "24px",
      }}
    >
      {children}
    </div>
  );
}
