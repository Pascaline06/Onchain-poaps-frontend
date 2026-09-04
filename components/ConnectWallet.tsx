"use client";
import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isWalletConnectConfigured } from "@/lib/wagmi";

/**
 * A plain <ConnectButton /> hands the click straight to RainbowKit's modal,
 * which — with no real WalletConnect project ID and no injected wallet
 * extension present (mobile Chrome, no extension) — was throwing during
 * its own connect attempt in a way that escaped every error boundary in
 * this app and took down the whole page. Catching that after the fact
 * (error.tsx, global-error.tsx) means a real user always sees a crash
 * screen first. This instead checks, before ever opening RainbowKit's
 * modal, whether a successful connection is even possible — and if not,
 * shows a plain explanatory message instead of attempting one.
 *
 * Once either condition is true (a real project ID gets added, or the
 * person opens this site somewhere an injected wallet exists — a desktop
 * browser extension, or a wallet app's own built-in browser), this reverts
 * to opening RainbowKit's normal modal with no other change needed.
 */
export function ConnectWallet() {
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false);

  useEffect(() => {
    setHasInjectedProvider(typeof window !== "undefined" && Boolean((window as any).ethereum));
  }, []);

  const canAttemptConnect = isWalletConnectConfigured || hasInjectedProvider;

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
        // RainbowKit's documented SSR-safe boilerplate: render an invisible
        // placeholder until mounted, to avoid a hydration mismatch.
        if (!mounted) {
          return (
            <div aria-hidden className="pointer-events-none opacity-0">
              <span className="btn-primary text-sm">Connect Wallet</span>
            </div>
          );
        }

        if (account && chain) {
          return (
            <button type="button" onClick={openAccountModal} className="btn-secondary text-sm">
              {account.displayName}
            </button>
          );
        }

        if (!canAttemptConnect) {
          return (
            <button
              type="button"
              className="btn-secondary text-sm opacity-70"
              onClick={() =>
                alert(
                  "No wallet found in this browser, and mobile wallet-app linking isn't set up on this deploy yet.\n\nEasiest fix: open this site inside your wallet app's own built-in browser (e.g. MetaMask's in-app browser) instead of a regular mobile browser."
                )
              }
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <button type="button" onClick={openConnectModal} className="btn-primary text-sm">
            Connect Wallet
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
