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
//
// metaMaskWallet, coinbaseWallet, and rainbowWallet ALL fall back to a
// WalletConnect-backed connection (for mobile deep-linking) whenever the
// matching browser extension isn't detected — which is exactly the mobile
// Chrome / no-extension case. With no real project ID, that fallback isn't
// "degraded," it throws when tapped, and that throw is what was crashing
// the whole page. So when WalletConnect genuinely isn't configured, those
// three tiles are swapped out for just `injectedWallet` — the one wallet
// type that talks straight to window.ethereum and never touches
// WalletConnect at all. It won't deep-link into the MetaMask app without a
// real project ID (nothing can), but tapping it will show a clear "not
// detected" state instead of crashing. The moment a real project ID is set,
// this condition flips back to the full tile set automatically — no other
// code change needed.
const connectors = connectorsForWallets(
  [
    {
      groupName: "Popular",
      wallets: isWalletConnectConfigured
        ? [metaMaskWallet, coinbaseWallet, rainbowWallet, walletConnectWallet, injectedWallet]
        : [injectedWallet],
    },
  ],
  {
    appName: "Onchain POAPs",
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
