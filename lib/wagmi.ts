import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { farcasterMiniApp } from "@farcaster/miniapp-wagmi-connector";
import { injected, walletConnect } from "wagmi/connectors";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";

// The Farcaster connector is listed first and, inside a Farcaster client, it
// auto-connects the user's Farcaster wallet with no extra tap — that's what
// "genuinely usable Mini App" means in practice, not just an iframe of the
// website. Outside Farcaster it's simply inert and injected/WalletConnect
// take over, so this one config file serves both the website and the Mini App.
export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    farcasterMiniApp(),
    injected(),
    ...(projectId ? [walletConnect({ projectId, showQrModal: true })] : []),
  ],
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
