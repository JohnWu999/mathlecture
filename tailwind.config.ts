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
          grid: "#EDE8D8",
        },
        crayon: {
          yellow: "#F5E6C8",
          green: "#A8D5A2",
          blue: "#A2C4E0",
          pink: "#E8B4B8",
          orange: "#E8C9A8",
        },
        ink: {
          DEFAULT: "#5C4B37",
          light: "#8A7B6D",
        },
        border: {
          hand: "#5C4B37",
        },
      },
      fontFamily: {
        hand: ["'ZCOOL KuaiLe'", "'Noto Sans SC'", "cursive"],
        body: ["'PingFang SC'", "'Microsoft YaHei'", "'Noto Sans SC'", "system-ui", "sans-serif"],
      },
      borderRadius: {
        hand: "24px",
        sticker: "18px 12px 22px 14px / 14px 20px 10px 24px",
      },
      boxShadow: {
        sticker: "3px 3px 0px 0px rgba(92,74,61,0.12)",
        float: "4px 4px 12px rgba(92,74,61,0.08)",
        watercolor: "0 0 20px rgba(0,0,0,0.06)",
        "watercolor-yellow": "0 0 18px rgba(255,200,50,0.25)",
        "watercolor-green": "0 0 18px rgba(100,220,100,0.25)",
        "watercolor-blue": "0 0 18px rgba(100,180,220,0.25)",
        "watercolor-pink": "0 0 18px rgba(255,150,170,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
