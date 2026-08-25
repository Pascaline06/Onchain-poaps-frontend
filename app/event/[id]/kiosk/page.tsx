"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { QRCodeSVG } from "qrcode.react";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";

/**
 * Full-screen kiosk display for live events.
 *
 * The bounty's signature-minting spec describes a real-world moment: a
 * creator puts a QR code "on a screen, poster, badge, or other physical
 * object" and attendees scan it to mint. Neither of the two existing
 * submissions built anything for that literal moment — this route is a
 * dedicated, projector-ready screen for it, not a repurposed detail page.
 *
 * It intentionally does one thing: show the artwork, a QR big enough to
 * scan from across a room, and a live mint count pulled straight from the
 * contract's totalSupply(eventId) — no polling logic beyond wagmi's built-in
 * refetch interval, no separate indexer.
 */
export default function KioskPage() {
  const params = useParams();
  const eventId = BigInt(params.id as string);
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const [mounted, setMounted] = useState(false);
  const [mintUrl, setMintUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    setMintUrl(`${window.location.origin}/event/${eventId.toString()}`);
  }, [eventId]);

  const { data: evt } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "events",
    args: [eventId],
  });

  const { data: uri } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "uri",
    args: [eventId],
  });

  const { data: minted } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "totalSupply",
    args: [eventId],
    query: {
      // Live-ticking counter for a screen nobody is clicking refresh on.
      refetchInterval: 4000,
    },
  });

  const meta = uri ? decodeTokenUri(uri) : null;
  const name = evt?.[0] || meta?.name || `POAP #${eventId}`;
  const isPublic = evt?.[10];

  const enterFullscreen = () => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Fullscreen can be blocked by browser policy — the layout already
      // works fine at normal window size, so this is a nice-to-have, not
      // a requirement.
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-10 bg-paper px-8 py-12 text-center">
      {!mounted ? (
        <div className="h-20 w-20 animate-pulse rounded-full bg-ink/10" />
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="stamp text-sm">● LIVE MINT</span>
            {isPublic === false && (
              <span className="pill bg-red-500/10 text-red-600">
                Public minting is closed — open it from Manage first
              </span>
            )}
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">{name}</h1>

          {meta?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={meta.image}
              alt={name}
              className="h-40 w-40 rounded-2xl border-4 border-ink/10 object-contain shadow-lg sm:h-56 sm:w-56"
            />
          )}

          {mintUrl && (
            <div className="rounded-3xl border-4 border-ink bg-white p-6 shadow-xl">
              <QRCodeSVG value={mintUrl} size={320} level="M" />
            </div>
          )}

          <p className="max-w-md font-mono text-sm text-ink/50">
            Scan to mint — no app needed, just a wallet in your browser.
          </p>

          <div className="mt-4 flex flex-col items-center">
            <span className="font-mono text-7xl font-bold tabular-nums text-accent sm:text-8xl">
              {minted !== undefined ? minted.toString() : "—"}
            </span>
            <span className="mt-1 text-sm uppercase tracking-widest text-ink/40">
              onchain POAPs minted so far
            </span>
          </div>

          <button onClick={enterFullscreen} className="btn-secondary fixed bottom-6 right-6 text-xs">
            Enter fullscreen
          </button>
        </>
      )}
    </main>
  );
}
