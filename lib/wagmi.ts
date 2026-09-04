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

const projectId = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";

/**
 * WalletConnect project IDs are 32-character hexadecimal strings. Treating
 * any non-empty value as valid meant placeholders such as "YOUR_PROJECT_ID"
 * enabled WalletConnect-backed mobile connectors and then failed at runtime.
 * Validate the shape here so a bad environment variable degrades safely
 * instead of crashing the connection flow.
 */
export const isWalletConnectConfigured = /^[0-9a-f]{32}$/i.test(projectId);

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
    // RainbowKit requires a projectId value even when only injected wallets
    // are exposed. This sentinel is never used for a WalletConnect request
    // because those connectors are omitted above when configuration is bad.
    projectId: isWalletConnectConfigured ? projectId : "00000000000000000000000000000000",
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
