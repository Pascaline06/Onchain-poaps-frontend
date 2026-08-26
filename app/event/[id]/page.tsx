"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { MintPanel } from "@/components/MintPanel";
import { Countdown } from "@/components/Countdown";
import { POAPArtwork } from "@/components/POAPArtwork";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = BigInt(id);
  // Public event data shouldn't wait on a connected wallet — someone scanning
  // a shared link or QR code should see the artwork immediately and decide
  // whether to connect, not stare at a loading state until they do.
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const search = useSearchParams();

  // Supports the QR-code flow: a link like /event/3?sig=0x...&for=0xabc pre-fills
  // the signature box so a scanning attendee doesn't have to copy/paste anything.
  const [prefillSig] = useState(search.get("sig") ?? "");

  const { data: evt, isLoading } = useReadContract({
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

  if (isLoading || !evt) {
    return (
      <main>
        <Nav />
        <div className="px-6 py-12 text-ink/50">Loading POAP #{id}…</div>
      </main>
    );
  }

  const [name, description, eventDate, location, allowlistRoot, , creator, createdAt, externalUrl, isSoulbound, isPublic] = evt;
  const meta = uri ? decodeTokenUri(uri) : null;

  return (
    <main>
      <Nav />
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 px-6 py-12 md:grid-cols-2">
        <div>
          <div className="card flex h-80 items-center justify-center p-6">
            <POAPArtwork
              imageDataUri={meta?.image}
              alt={name}
              className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
              fallback={
                <div className="flex flex-col items-center gap-2 text-ink/25">
                  <svg width="36" height="36" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1.5" y="4.5" width="25" height="19" rx="2.5" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" />
                    <circle cx="9" cy="12" r="2" stroke="currentColor" strokeWidth="1.4" />
                    <path d="M2 20l6-5 4.5 4 5-6 8.5 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs uppercase tracking-wide">No artwork set</span>
                </div>
              }
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {isSoulbound && <span className="pill bg-ink/10 text-ink/60">Soulbound</span>}
            {isPublic && <span className="pill bg-accent2/20 text-accent2">Public mint open</span>}
            <Countdown createdAt={createdAt} kind="creator" />
            <Countdown createdAt={createdAt} kind="signature" />
          </div>
        </div>

        <div>
          <h1 className="font-display text-3xl font-bold">{name}</h1>
          {description && <p className="mt-2 text-ink/70">{description}</p>}
          <dl className="mt-4 space-y-1 text-sm text-ink/50">
            {location && <div><dt className="inline font-medium">Location: </dt><dd className="inline">{location}</dd></div>}
            {eventDate > 0n && (
              <div><dt className="inline font-medium">Date: </dt><dd className="inline">{new Date(Number(eventDate) * 1000).toLocaleDateString()}</dd></div>
            )}
            <div><dt className="inline font-medium">Creator: </dt><dd className="inline font-mono">{creator}</dd></div>
            {externalUrl && (
              <div>
                <a href={externalUrl} target="_blank" rel="noreferrer" className="text-accent2 underline">
                  {externalUrl}
                </a>
              </div>
            )}
          </dl>

          <div className="mt-6">
            <MintPanel eventId={eventId} evt={{ name, isPublic, isSoulbound, allowlistRoot, createdAt, creator }} prefillSig={prefillSig} />
          </div>

          {prefillSig && <p className="mt-3 text-xs text-ink/40">Signature detected from your link — paste it into the box above if it wasn't filled automatically.</p>}

          <a href={`/event/${id}/manage`} className="mt-6 inline-block text-sm text-ink/40 underline">
            Creator? Manage this POAP →
          </a>
        </div>
      </div>
      <Footer />
    </main>
  );
}
