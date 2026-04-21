import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#020610",
        deep: "#050d1e",
        bg: "#081229",
        bg2: "#0a1630",
        card: "#0c1a38",
        border: "#132240",
        border2: "#1e3560",
        neural: "#00d4e8",
        neural2: "#00b0c4",
        neural3: "#00f0ff",
        pulse: "#6c9fff",
        pulse2: "#4a7de8",
        signal: "#ff6b35",
        amber: "#f5a623",
        danger: "#ff4d6a",
        green: "#2dd4aa",
        t1: "#edf5ff",
        t2: "#7aa0c0",
        t3: "#2e4a6a",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
