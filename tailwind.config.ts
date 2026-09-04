import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme: "paper" is now a lightened-black charcoal (not pure
        // #000 — a printed page at night, not a void) and "ink" is a warm
        // off-white foreground, echoing the site's original cream paper
        // tone now cast as the text color instead of the background. Every
        // text-ink/border-ink/bg-ink utility across the app is driven by
        // these two tokens, so flipping them here re-themes the whole site
        // without touching each component.
        ink: "#f3efe6",
        paper: "#1a1b1f",
        "paper-raised": "#212226",
        accent: "#ff5a1f",
        accent2: "#4d8dff",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      typography: {
        // Kept in sync with the ink/accent2 tokens above rather than
        // Tailwind Typography's own light-mode defaults — the Docs page is
        // the one place a whole article's worth of prose text depends on
        // these, so if they don't track the site's dark theme the entire
        // page reads as near-invisible dark text on a dark background.
        DEFAULT: {
          css: {
            "--tw-prose-body": "#f3efe6",
            "--tw-prose-headings": "#f3efe6",
            "--tw-prose-links": "#4d8dff",
            "--tw-prose-bold": "#f3efe6",
            "--tw-prose-bullets": "#f3efe6",
            "--tw-prose-code": "#f3efe6",
            maxWidth: "none",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
