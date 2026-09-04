"use client";
import { useState } from "react";
import { usePassportEntryData } from "@/lib/usePassportEntryData";
import { formatEventDate } from "./PassportEntry";
import { POAPArtwork } from "./POAPArtwork";
import { exportBoardingPass } from "@/lib/exportBoardingPass";
import { barcodeBars } from "@/lib/boardingPassBarcode";
import { openSeaUrl, baseScanTxUrl, shortAddress } from "@/lib/links";

/**
 * The "sharing a single mint" piece of the four planned features (alongside
 * the Passport, the generative-ink palette, and Fellow Travelers). Where
 * the Passport is about browsing a whole collection, this is about the one
 * moment right after a mint — turning a bare transaction hash into
 * something that actually feels like proof you were there, and something
 * worth sharing.
 *
 * Reused in two places: right after a fresh mint (justMinted, with the tx
 * hash available for a direct BaseScan link) and on revisiting an event you
 * already hold a POAP for (no tx hash on hand, so that link is omitted).
 */
export function BoardingPass({
  eventId,
  owner,
  chainId,
  txHash,
  justMinted,
}: {
  eventId: bigint;
  owner: `0x${string}`;
  chainId: number;
  txHash?: `0x${string}`;
  justMinted?: boolean;
}) {
  const data = usePassportEntryData(eventId);
  const [downloading, setDownloading] = useState(false);

  const shareText = `Just minted "${data.name || "a POAP"}" onchain — proof you were there, forever.`;
  const appUrl = typeof window !== "undefined" ? window.location.href : "";
  const castIntentUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;
  const bars = barcodeBars(`${owner}-${eventId.toString()}`, 14);

  async function handleDownload() {
    setDownloading(true);
    try {
      await exportBoardingPass({
        data,
        eventId,
        owner,
        filename: `boarding-pass-${eventId.toString()}.png`,
      });
    } finally {
      setDownloading(false);
    }
  }

  if (!data.loaded) {
    return <div className="h-56 animate-pulse rounded-2xl bg-ink/5" />;
  }

  return (
    <div>
      <p className="mb-3 text-center text-sm text-accent2">
        {justMinted ? "Minted! Here's your boarding pass." : "You hold this POAP."}
      </p>
      <div className="relative flex flex-col overflow-hidden rounded-2xl border border-ink/10 bg-ink/[0.04] shadow-sm sm:flex-row">
        {/* Main stub */}
        <div className="flex-1 p-5">
          <p className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
            Boarding Pass · Onchain POAPs
          </p>
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0">
              <POAPArtwork
                imageDataUri={data.image}
                alt={data.name || "POAP"}
                className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
                fallback={<div className="h-full w-full rounded-xl border-2 border-dashed border-ink/15" />}
              />
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">{data.name || "Untitled POAP"}</p>
              <p className="mt-1 text-xs text-ink/50">
                {[data.location, formatEventDate(data.eventDate)].filter(Boolean).join(" · ") ||
                  "No date or location given"}
              </p>
            </div>
          </div>

          <div className="my-4 border-t border-dashed border-ink/10" />

          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">Passenger</p>
              <p className="font-mono text-sm">{shortAddress(owner)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">Gate</p>
              <p className="font-mono text-sm">Base Sepolia</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-wide text-ink/40">Event No.</p>
              <p className="font-mono text-sm">#{eventId.toString()}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={handleDownload} disabled={downloading} className="boarding-pass-btn">
              {downloading ? "Preparing…" : "Download"}
            </button>
            <a href={castIntentUrl} target="_blank" rel="noreferrer" className="boarding-pass-btn">
              Share on Farcaster
            </a>
            <a href={openSeaUrl(chainId, eventId)} target="_blank" rel="noreferrer" className="boarding-pass-btn">
              View on OpenSea
            </a>
            {txHash && (
              <a href={baseScanTxUrl(txHash)} target="_blank" rel="noreferrer" className="boarding-pass-btn">
                View on BaseScan
              </a>
            )}
          </div>
        </div>

        {/* Perforation — horizontal on narrow screens, vertical from sm up */}
        <div className="relative mx-5 border-t-2 border-dashed border-ink/15 sm:hidden">
          <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-paper" />
          <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full bg-paper" />
        </div>
        <div className="relative hidden w-0 sm:block">
          <div className="absolute inset-y-0 border-l-2 border-dashed border-ink/15" />
          <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-paper" />
          <div className="absolute -left-2 -bottom-2 h-4 w-4 rounded-full bg-paper" />
        </div>

        {/* Ticket stub */}
        <div className="flex items-center justify-center gap-4 bg-ink/[0.03] p-4 sm:w-28 sm:flex-col sm:justify-center">
          <span className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.2em] text-ink/40 sm:-rotate-90">
            Verified Onchain
          </span>
          <div className="flex h-8 items-end gap-[2px]">
            {bars.map((h, i) => (
              <span key={i} className="w-[3px] bg-ink/50" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
          <span className="font-mono text-[10px] text-ink/40">#{eventId.toString()}</span>
        </div>
      </div>
    </div>
  );
}
