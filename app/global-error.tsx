"use client";

import { useEffect } from "react";

/**
 * Only fires if something throws inside the root layout itself (rare —
 * app/error.tsx below catches everything else). Required to define its own
 * <html>/<body> since it fully replaces the document when it triggers.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Onchain POAPs — global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#faf7f0", color: "#0b0d10", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ maxWidth: 420, margin: "0 auto", padding: "6rem 1.5rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>That didn&apos;t load right.</h1>
          <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", opacity: 0.7 }}>
            Something failed before the page could even render — usually a wallet-connection issue.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              marginTop: "1.5rem",
              borderRadius: "0.75rem",
              background: "#ff5a1f",
              color: "#0b0d10",
              fontWeight: 600,
              padding: "0.75rem 1.25rem",
              border: "none",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
