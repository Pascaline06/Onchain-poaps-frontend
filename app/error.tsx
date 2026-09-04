"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Onchain POAPs — route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="stamp mb-4">Something slipped</p>
      <h1 className="font-display text-2xl font-bold">That didn&apos;t load right.</h1>
      <p className="mt-3 text-sm text-ink/70">
        A browser, wallet, or network request failed unexpectedly. Your onchain POAPs are unaffected. Try the page again, or return home and reopen the action.
      </p>
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={() => reset()} className="btn-primary">Try again</button>
        <a href="/" className="btn-secondary">Go home</a>
      </div>
    </div>
  );
}
