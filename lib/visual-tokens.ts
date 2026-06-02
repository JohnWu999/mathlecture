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
