"use client";
import Link from "next/link";
import { useState } from "react";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";

export function POAPCard({ eventId, manageLink }: { eventId: bigint; manageLink?: boolean }) {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  // Tracks whether the browser itself refused to render the decoded SVG (a
  // separate failure mode from "the metadata read failed" — see below).
  const [imgFailed, setImgFailed] = useState(false);

  const { data: evt } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "events",
    args: [eventId],
  });

  const { data: uri, error: uriError } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "uri",
    args: [eventId],
  });

  if (!evt) return <div className="card h-56 animate-pulse" />;

  const [name, , , location, allowlistRoot, , , , , isSoulbound, isPublic] = evt;
  const meta = uri ? decodeTokenUri(uri) : null;

  // Three genuinely different failure modes were getting flattened into one
  // "no artwork" message, which made this impossible to actually debug from
  // a screenshot. Now each one says what actually happened:
  //   1. The uri() call itself reverted or errored (an RPC/gas problem —
  //      large SSTORE2 reads doing on-chain base64 encoding can be gas-
  //      heavy, and some public RPCs cap eth_call gas below what that costs)
  //   2. The call succeeded but decoding/parsing the returned JSON failed
  //   3. Decoding succeeded but the browser rejected the SVG itself — most
  //      often because it references something disallowed in an <img> tag
  //      (external stylesheets, scripts, certain filters)
  let emptyReason: string | null = null;
  if (uriError) {
    emptyReason = "Couldn't read artwork (RPC error)";
    if (typeof window !== "undefined") {
      console.error(`[POAPCard #${eventId}] uri() call failed:`, uriError.message);
    }
  } else if (uri && !meta) {
    emptyReason = "Couldn't decode metadata";
    if (typeof window !== "undefined") {
      console.error(`[POAPCard #${eventId}] decodeTokenUri failed on a successfully-fetched uri.`);
    }
  } else if (meta && !meta.image) {
    emptyReason = "No artwork set";
  } else if (imgFailed) {
    emptyReason = "Browser rejected this SVG";
    if (typeof window !== "undefined") {
      console.error(`[POAPCard #${eventId}] <img> onError — the decoded SVG likely references something an <img> tag disallows (external stylesheet, script, certain filters).`);
    }
  }

  return (
    <Link
      href={`/event/${eventId}`}
      className="card group block overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
    >
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-ink/5 p-3">
        {meta?.image && !imgFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={meta.image}
            alt={name}
            onError={() => setImgFailed(true)}
            className="max-h-full max-w-full transition-transform duration-200 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-ink/25">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1.5" y="4.5" width="25" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
              <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
              <path d="M2 20l6-5 4.5 4 5-6 8.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-center text-[10px] uppercase tracking-wide">{emptyReason ?? "Artwork not set"}</span>
          </div>
        )}
      </div>
      <p className="truncate font-display font-semibold">{name || `POAP #${eventId}`}</p>
      {location && <p className="truncate text-xs text-ink/50">{location}</p>}
      <div className="mt-2 flex flex-wrap gap-1">
        {isSoulbound && <span className="pill bg-ink/10 text-ink/60">Soulbound</span>}
        {isPublic && <span className="pill bg-accent2/20 text-accent2">Public</span>}
        {allowlistRoot !== "0x0000000000000000000000000000000000000000000000000000000000000000" && (
          <span className="pill bg-accent/20 text-accent">Allowlist</span>
        )}
      </div>
      {manageLink && (
        <span className="mt-2 inline-block text-xs text-ink/40 underline">Manage →</span>
      )}
    </Link>
  );
}
