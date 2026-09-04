import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // "ink" is the foreground (text) and "paper" is the background —
        // those names stayed the same when the theme flipped from light to
        // dark, since ~20+ files already reference them semantically
        // (bg-paper, text-ink, border-ink/10 etc.) rather than by literal
        // color. Flipping what the tokens resolve to, rather than
        // rewriting every file that uses them, is what makes this a safe
        // site-wide change instead of a risky one.
        ink: "#f2ede4",
        paper: "#1c1c1f",
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
            "--tw-prose-body": "#f2ede4",
            "--tw-prose-headings": "#f2ede4",
            "--tw-prose-links": "#5b9dff",
            "--tw-prose-bold": "#f2ede4",
            "--tw-prose-bullets": "#f2ede4",
            "--tw-prose-code": "#f2ede4",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
