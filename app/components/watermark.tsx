"use client";

interface WatermarkProps {
  text?: string;
  className?: string;
}

export default function Watermark({ text = "数学小讲师联盟", className = "" }: WatermarkProps) {
  return (
    <div
      className={`pointer-events-none select-none absolute bottom-2 right-2 z-50 ${className}`}
      style={{
        opacity: 0.35,
        fontSize: "12px",
        color: "#5C4B37",
        fontWeight: 500,
        letterSpacing: "0.05em",
        textShadow: "0 0 2px rgba(255,255,255,0.8)",
        transform: "rotate(-3deg)",
      }}
    >
      {text}
    </div>
  );
}
