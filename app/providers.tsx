"use client";

import { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { wagmiConfig } from "@/lib/wagmi";
import { sdk } from "@farcaster/miniapp-sdk";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Tells the Farcaster client the app has finished its first paint and it's
    // safe to hide the splash screen. Calling this is what separates "a Mini
    // App" from "a website an iframe pointed at" — skip it and the app hangs
    // behind Farcaster's loading screen forever, even though it actually loaded.
    // No-ops harmlessly when running as a plain website (sdk.actions.ready
    // resolves immediately outside a Farcaster client).
    sdk.actions.ready().catch(() => void 0).finally(() => setReady(true));
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({ accentColor: "#ff5a1f" })} modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
