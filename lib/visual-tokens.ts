export const colors = {
  ink: "#3E2723",
  inkLight: "#5D4037",
  muted: "#8D6E63",
  border: "#8D6E63",
  green: "#184638",
  leaf: "#2f8f67",
  sprout: "#8bd86f",
  cream: "#fffdf3",
  paper: "#FAFAF5",
  sun: "#ffd166",
  orange: "#f9733d",
  blue: "#3b82f6",
  crayonGreen: "#C8E6C9",
  crayonBlue: "#BBDEFB",
  crayonYellow: "#FFF9C4",
} as const;

export const fonts = {
  title: "'ZCOOL KuaiLe', 'Noto Sans SC', cursive",
  body: "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif",
} as const;

export const handDrawn = {
  organicRadius: "255px 15px 225px 15px / 15px 225px 15px 255px",
  softCardRadius: "4px 12px 8px 16px / 16px 8px 12px 4px",
  wavyLineDataUrl:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='4' viewBox='0 0 40 4'%3E%3Cpath d='M0 2 Q5 0 10 2 T20 2 T30 2 T40 2' fill='none' stroke='%238D6E63' stroke-width='2' stroke-dasharray='3,5' stroke-linecap='round'/%3E%3C/svg%3E\")",
} as const;

export const identityColors = {
  questioner: colors.crayonYellow,
  lecturer: colors.crayonGreen,
  explorer: colors.crayonBlue,
} as const;

export type IdentityColorKey = keyof typeof identityColors;


export const layoutTokens = {
  maxContent: "max-w-6xl",
  homeNarrow: "max-w-[400px]",
  homeWide: "max-w-[720px]",
  homeCardWide: "max-w-[600px]",
} as const;

export const motionTokens = {
  gentleRotations: [-2, 1, -3],
  trustRotations: [-2, 1, -1],
  plantTransforms: [
    { transform: "rotate(-5deg)" },
    { transform: "scale(1.3) translateY(-15px)" },
    { transform: "scale(0.8)" },
  ],
  currentPlantTransform: { transform: "scale(1.3) translateY(-15px)" },
} as const;

export const mathDoodles = [
  { symbol: "∞", className: "top-8 left-8 text-4xl opacity-[0.08] doodle-float" },
  { symbol: "×", className: "top-20 right-12 text-3xl opacity-[0.1] doodle-float-slow" },
  { symbol: "÷", className: "top-1/3 left-6 text-3xl opacity-[0.1] doodle-float-fast" },
  { symbol: "π", className: "top-1/3 right-8 text-3xl opacity-[0.08] doodle-float" },
  { symbol: "∑", className: "bottom-1/3 left-12 text-3xl opacity-[0.12] doodle-float-slow" },
  { symbol: "√", className: "bottom-1/3 right-6 text-3xl opacity-[0.1] doodle-float-fast" },
  { symbol: "±", className: "bottom-20 left-8 text-3xl opacity-[0.08] doodle-float" },
  { symbol: "∞", className: "bottom-16 right-12 text-4xl opacity-[0.1] doodle-float-slow" },
  { symbol: "✦", className: "top-32 left-[15%] text-2xl opacity-[0.06] doodle-float-slow" },
  { symbol: "?", className: "top-[45%] right-[12%] text-2xl opacity-[0.07] doodle-float" },
  { symbol: "+", className: "bottom-[25%] left-[20%] text-3xl opacity-[0.08] doodle-float-fast" },
  { symbol: "=", className: "top-[60%] right-[18%] text-2xl opacity-[0.06] doodle-float-slow" },
  { symbol: "?", className: "bottom-32 right-[25%] text-2xl opacity-[0.07] doodle-float" },
] as const;
