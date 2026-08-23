"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";

export function POAPCard({ eventId, manageLink }: { eventId: bigint; manageLink?: boolean }) {
  const { chainId } = useAccount();

  const { data: evt } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "events",
    args: [eventId],
    query: { enabled: Boolean(chainId) },
  });

  const { data: uri } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "uri",
    args: [eventId],
    query: { enabled: Boolean(chainId) },
  });

  if (!evt) return <div className="card h-56 animate-pulse" />;

  const [name, , , location, allowlistRoot, , , , , isSoulbound, isPublic] = evt;
  const meta = uri ? decodeTokenUri(uri) : null;

  return (
    <Link href={`/event/${eventId}`} className="card block overflow-hidden p-4 transition hover:border-accent/50">
      <div className="mb-3 flex h-32 items-center justify-center rounded-xl bg-ink/5 p-3">
        {meta?.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.image} alt={name} className="max-h-full max-w-full" />
        ) : (
          <span className="text-xs text-ink/30">no artwork</span>
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
