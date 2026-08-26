"use client";
import { useReadContract } from "wagmi";
import { useAccount } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { POAPArtwork } from "./POAPArtwork";

/**
 * A fanned stack of real, live artwork from the contract — not a mockup, not
 * a stock illustration. The whole pitch of this protocol is "your art lives
 * onchain forever," so the hero should prove that by rendering something
 * that's actually sitting on Base Sepolia right now, not an image file we
 * shipped in /public.
 */
function StackedThumb({ eventId, rotate, z }: { eventId: bigint; rotate: number; z: number }) {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;

  const { data: uri } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "uri",
    args: [eventId],
  });

  const meta = uri ? decodeTokenUri(uri) : null;
  if (!meta?.image) return null;

  return (
    <div
      className="card absolute h-40 w-40 overflow-hidden p-2 shadow-xl sm:h-48 sm:w-48"
      style={{ transform: `rotate(${rotate}deg)`, zIndex: z, left: "50%", marginLeft: "-5rem" }}
    >
      <POAPArtwork
        imageDataUri={meta.image}
        alt={meta.name}
        className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
        fallback={null}
      />
    </div>
  );
}

export function HeroStack() {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;

  const { data: total } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "totalEvents",
  });

  if (total === undefined) {
    return <div className="mx-auto h-56 w-56 animate-pulse rounded-2xl bg-ink/5 sm:h-64 sm:w-64" />;
  }

  // Most recent three, fanned like a hand of tickets — deliberately not the
  // very latest one alone, since a single small thumbnail reads as an icon,
  // not proof of a working, growing protocol.
  const n = Number(total);
  const ids = [n, n - 1, n - 2].filter((i) => i >= 0).map(BigInt);

  return (
    <div className="relative mx-auto h-56 w-56 sm:h-64 sm:w-64">
      {ids
        .slice()
        .reverse()
        .map((id, i) => (
          <StackedThumb key={id.toString()} eventId={id} rotate={(i - 1) * 8} z={i} />
        ))}
    </div>
  );
}
