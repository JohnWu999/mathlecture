import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "#FAF8F0",
          grid: "#E8F5E9",
        },
        crayon: {
          yellow: "#FFF8DC",
          green: "#90EE90",
          blue: "#87CEEB",
          pink: "#FFB6C1",
          orange: "#FFDAB9",
        },
        ink: {
          DEFAULT: "#3D3D3D",
          light: "#6B6B6B",
        },
      },
      fontFamily: {
        hand: ["'ZCOOL KuaiLe'", "'Noto Sans SC'", "cursive"],
        body: ["'Noto Sans SC'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        hand: "24px",
      },
      boxShadow: {
        sticker: "3px 3px 0px 0px rgba(0,0,0,0.15)",
        float: "4px 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
