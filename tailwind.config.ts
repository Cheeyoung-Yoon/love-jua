import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        gold: "var(--gold)",
        accent: "var(--accent)",
        rose: "var(--rose)",
      },
      boxShadow: {
        ribbon: "0 12px 24px rgba(0,0,0,0.35)",
      },
      keyframes: {
        knotHover: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "50%": { transform: "rotate(2deg)" },
        },
        petalDrift: {
          "0%": { transform: "translateY(-10%) rotate(0deg)" },
          "100%": { transform: "translateY(110%) rotate(180deg)" },
        },
      },
      animation: {
        knotHover: "knotHover 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
