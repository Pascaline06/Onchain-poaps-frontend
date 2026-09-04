import { isWalletConnectConfigured } from "@/lib/wagmi";

/**
 * Keep wallet misconfiguration visible to the person deploying the app, but
 * do not block users: mobile browsers can still hand the current page off to
 * MetaMask safely. A valid WalletConnect project ID enables direct hand-off
 * to other wallet apps from ordinary Chrome/Mises/Safari sessions.
 */
export function EnvWarningBanner() {
  if (isWalletConnectConfigured) return null;
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-2 text-center text-xs text-ink/80">
      Mobile wallet linking is in safe fallback mode. Add a valid{" "}
      <code className="rounded bg-ink/10 px-1 py-0.5">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>{" "}
      in Vercel to enable WalletConnect and other external wallets. MetaMask users can still use the built-in
      “Open in MetaMask” hand-off.
    </div>
  );
}
