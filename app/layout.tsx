import type { Metadata } from "next";
import { Space_Mono, Inter } from "next/font/google";
import { Providers } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-mono", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

// Stripped of any trailing slash so `${appUrl}/og-image.png` etc. never
// produces a double slash regardless of how NEXT_PUBLIC_APP_URL was typed
// into the hosting provider's environment variable settings.
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://onchain-poaps.example.com").replace(/\/+$/, "");

export const metadata: Metadata = {
  title: "Onchain POAPs — Your Journey. Onchain Forever.",
  description:
    "Create, distribute, and collect fully onchain Proof of Attendance tokens. No IPFS, no backend — every pixel of every badge lives on Base.",
  other: {
    // Farcaster Mini App embed metadata — this is what makes a cast render
    // an interactive card instead of a plain link. See docs for the full spec.
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: `${appUrl}/og-image.png`,
      button: {
        title: "Open Onchain POAPs",
        action: { type: "launch_miniapp", url: appUrl, name: "Onchain POAPs", splashImageUrl: `${appUrl}/splash.png`, splashBackgroundColor: "#faf7f0" },
      },
    }),
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${spaceMono.variable} ${inter.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:`try{var t=localStorage.getItem('onchain-poaps-theme');document.documentElement.classList.toggle('dark',t?t==='dark':true)}catch(e){document.documentElement.classList.add('dark')}`}} />
      </head>
      <body className="font-body min-h-screen">
        {/* Providers (WagmiProvider/RainbowKitProvider) is declared here in
            the root layout, structurally outside the boundary Next.js's
            file-based app/error.tsx wraps (that one only covers the page
            segment passed in as `children`, not sibling-declared providers
            like this). Wrapping it explicitly with our own ErrorBoundary
            closes that gap — a render-time failure anywhere inside wallet
            connection handling is now guaranteed to be caught here rather
            than falling all the way through to app/global-error.tsx and
            taking out the whole document. */}
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
