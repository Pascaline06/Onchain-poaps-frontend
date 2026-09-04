import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  rainbowWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";

// Exported so the UI can warn instead of silently breaking. When this is
// false, MetaMask/Coinbase/Rainbow's mobile deep-link flow (which all
// route through WalletConnect's relay even though the tiles don't say
// "WalletConnect") gets rejected by the relay for having a bogus project
// ID. On a browser with no injected extension — e.g. mobile Chrome — that
// makes every wallet tile fail: the connect modal flickers through
// connecting/error states and then surfaces a WalletConnect error code.
// The fix lives in the hosting provider's env vars (a free project ID
// from https://cloud.walletconnect.com), not in this file.
export const isWalletConnectConfigured = Boolean(projectId);

// IMPORTANT: this must go through RainbowKit's own connector system
// (connectorsForWallets + the wallet definitions below), not wagmi's raw
// `injected()` / `walletConnect()` from "wagmi/connectors" passed straight
// into createConfig. RainbowKit's <ConnectButton> modal only knows how to
// render wallets built through its own wallet-list machinery — plain wagmi
// connectors aren't recognized by it, and the modal silently falls back to
// its "you don't have a wallet" onboarding screen with zero options, which
// is indistinguishable from a broken connector list unless you know to look
// here. (The Farcaster Mini App connector deliberately isn't listed here —
// it's connected automatically in app/providers.tsx when the app detects
// it's actually running inside a Farcaster client, via sdk.isInMiniApp().
// It should never need to appear as a manual option in this picker.)
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: [
        metaMaskWallet,
        coinbaseWallet,
        rainbowWallet,
        ...(projectId ? [walletConnectWallet] : []),
        injectedWallet,
      ],
    },
  ],
  {
    appName: "Onchain POAPs",
    // RainbowKit requires a projectId even for wallets that don't strictly
    // need WalletConnect, since it uses WalletConnect infrastructure as a
    // fallback (e.g. for mobile deep-linking). If this is ever empty in
    // production, WalletConnect-based options silently misbehave — that's
    // a configuration problem to fix in the hosting provider's env vars,
    // not something this file can paper over.
    projectId: projectId || "MISSING_WALLETCONNECT_PROJECT_ID",
  }
);

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors,
  transports: {
    [baseSepolia.id]: http(rpcUrl),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
