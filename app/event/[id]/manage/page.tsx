"use client";
import { useParams } from "next/navigation";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PublicMintToggle } from "@/components/PublicMintToggle";
import { AllowlistManager } from "@/components/AllowlistManager";
import { SignatureGuide } from "@/components/SignatureGuide";
import { CreatorBatchMint } from "@/components/CreatorBatchMint";
import { Countdown } from "@/components/Countdown";

const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";

export default function ManagePage() {
  const { id } = useParams<{ id: string }>();
  const eventId = BigInt(id);
  const { address, chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== "undefined" ? window.location.origin : "")).replace(/\/+$/, "");

  const { data: evt, isLoading } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "events",
    args: [eventId],
  });

  if (isLoading || !evt) {
    return (
      <main>
        <Nav />
        <div className="px-6 py-12 text-ink/50">Loading…</div>
      </main>
    );
  }

  const [name, , , , allowlistRoot, , creator, createdAt, , , isPublic] = evt;
  const isCreator = address && creator && address.toLowerCase() === creator.toLowerCase();

  if (!isCreator) {
    return (
      <main>
        <Nav />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <p className="text-ink/70">
            Only the creator of <span className="font-semibold">{name}</span> can manage its distribution.
          </p>
          <p className="mt-2 break-all font-mono text-xs text-ink/40">Creator: {creator}</p>
          {!address && <p className="mt-4 text-sm text-ink/50">Connect the creator's wallet to manage this event.</p>}
        </div>
      </main>
    );
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-2xl space-y-10 px-6 py-12">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-display text-3xl font-bold">Manage: {name}</h1>
            <a href={`/event/${eventId}/kiosk`} target="_blank" rel="noreferrer" className="btn-secondary text-sm">
              Open kiosk mode ↗
            </a>
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Kiosk mode is a full-screen QR + live mint counter, made for projecting at a physical event.
          </p>
          <div className="mt-2 flex gap-2">
            <Countdown createdAt={createdAt} kind="creator" />
            <Countdown createdAt={createdAt} kind="signature" />
          </div>
        </div>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Public minting</h2>
          <PublicMintToggle eventId={eventId} isPublic={isPublic} createdAt={createdAt} />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Allowlist</h2>
          <AllowlistManager eventId={eventId} currentRoot={allowlistRoot} rootAlreadySet={allowlistRoot !== ZERO_ROOT} />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Signature minting &amp; QR codes</h2>
          <SignatureGuide eventId={eventId} appUrl={appUrl} />
        </section>

        <section>
          <h2 className="mb-3 font-display text-lg font-semibold">Direct airdrop</h2>
          <CreatorBatchMint eventId={eventId} />
        </section>
      </div>
      <Footer />
    </main>
  );
}
