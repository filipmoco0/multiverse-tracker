import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        marvel: {
          red: "#E23636",
          crimson: "#E62429",
          gold: "#F59E0B",
          dark: "#0F1016",
          card: "#181A24",
          border: "#E23636",
          hover: "#FF4545",
        },
        dc: {
          blue: "#005792",
          dark: "#080E1E",
          card: "#121A30",
          yellow: "#FBBF24",
          cyan: "#00EAFF",
          electric: "#00D2D3",
          border: "#005792",
        },
        comic: {
          black: "#0A0B10",
          yellow: "#FFE600",
          paper: "#FDFBF7",
          dark: "#12131C",
          darker: "#0A0B10",
          card: "#171822",
          cardLight: "#202230",
          border: "#2E3245",
          red: "#FF3366",
          green: "#00E676",
          purple: "#7928CA",
        },
      },
      boxShadow: {
        comic: "4px 4px 0px 0px #000000",
        "comic-sm": "2px 2px 0px 0px #000000",
        "comic-lg": "6px 6px 0px 0px #000000",
        "comic-xl": "8px 8px 0px 0px #000000",
        "comic-white": "4px 4px 0px 0px #FFFFFF",
        "comic-marvel": "4px 4px 0px 0px #E62429",
        "comic-dc": "4px 4px 0px 0px #00EAFF",
        "comic-gold": "4px 4px 0px 0px #F59E0B",
        "comic-cyan": "4px 4px 0px 0px #00D2D3",
        "comic-green": "4px 4px 0px 0px #00E676",
        "comic-glow-marvel": "0 0 20px rgba(230, 36, 41, 0.4)",
        "comic-glow-dc": "0 0 20px rgba(0, 234, 255, 0.4)",
      },
      fontFamily: {
        comic: ["var(--font-bangers)", "Impact", "sans-serif"],
        display: ["var(--font-bebas)", "Impact", "sans-serif"],
        sans: ["var(--font-outfit)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "halftone-dots": "radial-gradient(circle, rgba(255, 255, 255, 0.12) 1.5px, transparent 1.5px)",
        "halftone-marvel": "radial-gradient(circle, rgba(226, 54, 54, 0.15) 1.5px, transparent 1.5px)",
        "halftone-dc": "radial-gradient(circle, rgba(0, 234, 255, 0.12) 1.5px, transparent 1.5px)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        "stamp-in": {
          "0%": { transform: "scale(2.5) rotate(-15deg)", opacity: "0" },
          "60%": { transform: "scale(0.95) rotate(-8deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(-10deg)", opacity: "1" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "stamp-in": "stamp-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
