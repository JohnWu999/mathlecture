import { colors, fonts, handDrawn, motionTokens } from "@/lib/visual-tokens";

export function TrustCard({
  icon,
  title,
  desc,
  background,
  index,
}: {
  icon: string;
  title: string;
  desc: string;
  background: string;
  index: number;
}) {
  return (
    <div
      className="flex flex-col items-center relative"
      style={{
        background,
        border: `2px solid ${colors.border}`,
        borderRadius: handDrawn.tornPaperRadius,
        padding: "32px 24px",
        transform: `rotate(${motionTokens.trustRotations[index]}deg)`,
      }}
    >
      {index < 2 && (
        <div className="home-desktop-flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center" aria-hidden="true">
          <span style={{ fontSize: "28px", color: colors.muted, opacity: 0.5, fontFamily: fonts.body }}>∞</span>
        </div>
      )}
      <div className="text-[32px] leading-none" aria-hidden="true">{icon}</div>
      <h3 className="mt-4 text-[15px]" style={{ fontFamily: fonts.title, color: colors.ink }}>
        {title}
      </h3>
      <p className="mt-2 text-[13px] leading-[1.6] max-w-[280px]" style={{ fontFamily: fonts.body, color: colors.inkLight }}>
        {desc}
      </p>
    </div>
  );
}
