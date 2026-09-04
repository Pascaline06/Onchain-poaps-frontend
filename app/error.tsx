"use client";

import { useEffect } from "react";

/**
 * Next.js's own error boundary for everything below the root layout.
 * Without a file here, an uncaught exception anywhere on a page falls
 * through to Next's built-in generic fallback — the blank screen reading
 * "Application error: a client-side exception has occurred (see the
 * browser console for more information)" with no way back except
 * navigating away. That's the screen a broken wallet-connection attempt
 * was hitting: RainbowKit/wagmi throwing during a connect attempt (most
 * likely from WalletConnect's relay rejecting a misconfigured project ID)
 * in a way the component-level <ErrorBoundary> in app/providers.tsx
 * doesn't reach, because this one sits above it, at the route level.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Onchain POAPs — route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="stamp mb-4">Something slipped</p>
      <h1 className="font-display text-2xl font-bold">That didn&apos;t load right.</h1>
      <p className="mt-3 text-sm text-ink/70">
        This is almost always a wallet-connection hiccup — most commonly a wallet trying to connect
        without a properly configured WalletConnect project ID — rather than anything wrong with your
        POAPs. Trying again usually fixes it.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">
          Try again
        </button>
        <a href="/" className="btn-secondary">
          Go home
        </a>
      </div>
    </div>
  );
}
