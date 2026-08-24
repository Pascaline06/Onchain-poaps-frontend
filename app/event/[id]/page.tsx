"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { Nav } from "@/components/Nav";
import { MintPanel } from "@/components/MintPanel";
import { Countdown } from "@/components/Countdown";

export default function EventPage() {
  const { id } = useParams<{ id: string }>();
  const eventId = BigInt(id);
  const { chainId } = useAccount();
  const search = useSearchParams();

  // Supports the QR-code flow: a link like /event/3?sig=0x...&for=0xabc pre-fills
  // the signature box so a scanning attendee doesn't have to copy/paste anything.
  const [prefillSig] = useState(search.get("sig") ?? "");

  const { data: evt, isLoading } = useReadContract({
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
          <div className="card flex items-center justify-center p-6">
            {meta?.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={meta.image} alt={name} className="max-h-80" />
            ) : (
              <span className="text-ink/30">no artwork</span>
            )}
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
    </main>
  );
}
