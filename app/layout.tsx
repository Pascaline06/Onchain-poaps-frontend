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
const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://onchain-poaps-frontend-mu.vercel.app").replace(/\/+$/, "");

const miniAppEmbed = {
  version: "1",
  imageUrl: `${appUrl}/og-image.png`,
  button: {
    title: "Open Onchain POAPs",
    action: {
      type: "launch_miniapp",
      url: appUrl,
      name: "Onchain POAPs",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#000000",
    },
  },
};

const frameEmbed = {
  ...miniAppEmbed,
  button: {
    ...miniAppEmbed.button,
    action: { ...miniAppEmbed.button.action, type: "launch_frame" },
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: "Onchain POAPs — Your Journey. Onchain Forever.",
  description:
    "Create, distribute, mint and collect fully onchain proof of attendance on Base, then turn it into a permanent Event Passport.",
  openGraph: {
    title: "Onchain POAPs",
    description: "Permanent proof of attendance, built directly on Base.",
    url: appUrl,
    siteName: "Onchain POAPs",
    images: [{ url: `${appUrl}/hero-image.png`, width: 1200, height: 630, alt: "Onchain POAPs" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Onchain POAPs",
    description: "Permanent proof of attendance, built directly on Base.",
    images: [`${appUrl}/hero-image.png`],
  },
  other: {
    // Farcaster Mini App feed embed. The legacy fc:frame tag is included
    // as a compatibility fallback for clients that still inspect it.
    "fc:miniapp": JSON.stringify(miniAppEmbed),
    "fc:frame": JSON.stringify(frameEmbed),
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
