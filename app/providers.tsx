"use client";

import { useEffect, useState } from "react";
import { WagmiProvider, useConnect } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { sdk } from "@farcaster/miniapp-sdk";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";

const queryClient = new QueryClient();

/**
 * Inside an actual Farcaster client, connect the user's Farcaster wallet
 * automatically — no picker, no extra tap. This is what makes the Mini App
 * "genuinely usable" rather than an iframe of the website: everywhere else
 * (a normal mobile browser, MetaMask's in-app browser, etc.) this is a
 * no-op and the person picks a wallet from RainbowKit's modal as normal.
 *
 * Deliberately NOT listed as a connector option in lib/wagmi.ts — outside a
 * real Farcaster client it has nothing to connect to, and RainbowKit's
 * modal has no good way to represent "only usable in one specific host app"
 * as a picker option, so it's handled here instead, gated on a real runtime
 * check (sdk.isInMiniApp()) rather than just always being present.
 */
function FarcasterAutoConnect() {
  const { connect } = useConnect();

  useEffect(() => {
    let cancelled = false;
    sdk
      .isInMiniApp()
      .then((isMiniApp) => {
        if (isMiniApp && !cancelled) {
          connect({ connector: farcasterMiniApp() });
        }
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [connect]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [, setReady] = useState(false);

  useEffect(() => {
    // Tells the Farcaster client the app has finished its first paint and
    // it's safe to hide the splash screen. Calling this is what separates
    // "a Mini App" from "a website an iframe pointed at" — skip it and the
    // app hangs behind Farcaster's loading screen forever, even though it
    // actually loaded. No-ops harmlessly outside a Farcaster client
    // (sdk.actions.ready resolves immediately there).
    sdk.actions.ready().catch(() => void 0).finally(() => setReady(true));
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={lightTheme({ accentColor: "#ff5a1f", accentColorForeground: "#0b0d10" })} modalSize="compact">
          <FarcasterAutoConnect />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
