import { isWalletConnectConfigured } from "@/lib/wagmi";

/**
 * Renders nothing once NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set correctly
 * on the hosting provider. Until then, wallet tiles that don't have an
 * injected extension to fall back on (MetaMask/Coinbase/Rainbow on a plain
 * mobile browser, in particular) will fail to connect — this says so
 * plainly instead of leaving that as a silent flicker for whoever's testing
 * the deploy.
 */
export function EnvWarningBanner() {
  if (isWalletConnectConfigured) return null;
  return (
    <div className="border-b border-accent/30 bg-accent/10 px-4 py-2 text-center text-xs text-ink/80">
      Wallet connections aren&apos;t fully configured — this deploy is missing a{" "}
      <code className="rounded bg-ink/10 px-1 py-0.5">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>. Until
      one is set, only a wallet browser extension can connect directly — MetaMask/Coinbase/Rainbow's
      mobile app deep-link is hidden rather than shown broken. Get a free project ID at{" "}
      <a href="https://cloud.walletconnect.com" target="_blank" rel="noreferrer" className="underline">
        cloud.walletconnect.com
      </a>{" "}
      and add it to this project&apos;s environment variables to restore it.
    </div>
  );
}
