"use client";

import { useEffect, useState } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isWalletConnectConfigured } from "@/lib/wagmi";

function metaMaskDeepLink() {
  if (typeof window === "undefined") return "https://metamask.io/download/";
  const dappPath = `${window.location.host}${window.location.pathname}${window.location.search}`;
  return `https://metamask.app.link/dapp/${dappPath}`;
}

/**
 * Mobile Chrome/Mises do not inject window.ethereum. Sending their MetaMask
 * choice through a half-configured WalletConnect connector can throw outside
 * the route tree and crash the page. On those browsers we use MetaMask's
 * official universal dapp link instead: it opens this exact page inside the
 * MetaMask browser, where an injected provider exists and the normal flow is
 * stable. WalletConnect remains available as an explicit secondary option
 * when a valid project ID is configured.
 */
export function ConnectWallet() {
  const [hasInjectedProvider, setHasInjectedProvider] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileChoices, setShowMobileChoices] = useState(false);

  useEffect(() => {
    setHasInjectedProvider(Boolean((window as any).ethereum));
    setIsMobile(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
  }, []);

  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, openAccountModal, mounted }) => {
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

        // Wallet-app browsers and desktop extensions have a real injected
        // provider, so use RainbowKit normally.
        if (hasInjectedProvider) {
          return (
            <button type="button" onClick={openConnectModal} className="btn-primary text-sm">
              Connect Wallet
            </button>
          );
        }

        // Plain mobile browsers get a safe hand-off instead of a connector
        // path that can crash when MetaMask is not injected.
        if (isMobile) {
          return (
            <>
              <button
                type="button"
                onClick={() => setShowMobileChoices(true)}
                className="btn-primary text-sm"
              >
                Connect Wallet
              </button>

              {showMobileChoices && (
                <div
                  className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/70 p-4 sm:items-center"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Connect a wallet"
                  onClick={() => setShowMobileChoices(false)}
                >
                  <div
                    className="w-full max-w-sm rounded-3xl border border-white/15 bg-[#0b0b0b] p-5 text-white shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="eyebrow text-[#ff641f]">MOBILE WALLET</p>
                    <h2 className="mt-2 text-2xl font-black">Connect without the crash.</h2>
                    <p className="mt-2 text-sm leading-relaxed text-white/60">
                      Open this page inside MetaMask, or use WalletConnect if this deployment has a valid project ID.
                    </p>

                    <a
                      href={metaMaskDeepLink()}
                      className="mt-5 flex w-full items-center justify-center rounded-full bg-[#ff641f] px-5 py-3 text-sm font-black text-white"
                    >
                      Open in MetaMask
                    </a>

                    {isWalletConnectConfigured && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowMobileChoices(false);
                          try {
                            openConnectModal();
                          } catch (error) {
                            console.error("Wallet modal failed to open", error);
                          }
                        }}
                        className="mt-3 w-full rounded-full border border-white/20 px-5 py-3 text-sm font-bold"
                      >
                        WalletConnect / other wallets
                      </button>
                    )}

                    {!isWalletConnectConfigured && (
                      <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-xs leading-relaxed text-white/50">
                        WalletConnect is not configured on this deployment, so regular mobile browsers cannot connect directly yet. The MetaMask hand-off above works now.
                      </p>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowMobileChoices(false)}
                      className="mt-3 w-full px-4 py-2 text-xs font-bold text-white/45"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        }

        if (isWalletConnectConfigured) {
          return (
            <button type="button" onClick={openConnectModal} className="btn-primary text-sm">
              Connect Wallet
            </button>
          );
        }

        return (
          <button
            type="button"
            className="btn-secondary text-sm opacity-70"
            onClick={() =>
              alert(
                "No injected wallet was found in this browser. Install a wallet extension, or configure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID on Vercel."
              )
            }
          >
            Connect Wallet
          </button>
        );
      }}
    </ConnectButton.Custom>
  );
}
