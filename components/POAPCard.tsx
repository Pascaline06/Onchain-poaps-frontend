"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { POAPArtwork } from "./POAPArtwork";

export function POAPCard({ eventId, manageLink }: { eventId: bigint; manageLink?: boolean }) {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;

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

  const meta = uri ? decodeTokenUri(uri) : null;

  if (!evt) return <div className="card h-56 animate-pulse" />;

  const [name, , , location, allowlistRoot, , , , , isSoulbound, isPublic] = evt;

  let emptyReason = "Artwork not set";
  if (uriError) emptyReason = "Couldn't read artwork (RPC error)";
  else if (uri && !meta) emptyReason = "Couldn't decode metadata";

  return (
    <Link
      href={`/event/${eventId}`}
      className="card group block overflow-hidden p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
    >
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-ink/5 p-3">
        <POAPArtwork
          imageDataUri={meta?.image}
          alt={name}
          className="flex h-full w-full items-center justify-center transition-transform duration-200 group-hover:scale-[1.03] [&_svg]:max-h-full [&_svg]:max-w-full"
          fallback={
            <div className="flex flex-col items-center gap-1.5 text-ink/25">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="1.5" y="4.5" width="25" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
                <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
                <path d="M2 20l6-5 4.5 4 5-6 8.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-center text-[10px] uppercase tracking-wide">{emptyReason}</span>
            </div>
          }
        />
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
