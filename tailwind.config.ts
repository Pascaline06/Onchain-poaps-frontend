import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0d10",
        paper: "#faf7f0",
        accent: "#ff5a1f",
        accent2: "#1f6fff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      typography: {
        DEFAULT: {
          css: {
            "--tw-prose-body": "#0b0d10",
            "--tw-prose-headings": "#0b0d10",
            "--tw-prose-links": "#1f6fff",
            "--tw-prose-bold": "#0b0d10",
            "--tw-prose-bullets": "#0b0d10",
            "--tw-prose-code": "#0b0d10",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
