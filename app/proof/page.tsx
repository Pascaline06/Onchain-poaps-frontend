"use client";

import Link from "next/link";
import { useAccount, useReadContracts } from "wagmi";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWallet } from "@/components/ConnectWallet";
import { POAPArtwork } from "@/components/POAPArtwork";
import { useOwnedEvents } from "@/lib/useOwnedEvents";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";

export default function ProofHubPage() {
  const { address, chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;
  const { status, owned } = useOwnedEvents();
  const { data: uris } = useReadContracts({
    contracts: owned.map((id) => ({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "uri" as const,
      args: [id] as const,
    })),
    query: { enabled: owned.length > 0 },
  });

  return (
    <main>
      <Nav />
      <div className="reference-page-shell">
        <div className="max-w-3xl">
          <p className="eyebrow text-accent">VERIFIABLE ATTENDANCE</p>
          <h1 className="reference-page-title">Your POAP<br />Proof Cards.</h1>
          <p className="reference-page-lead">
            Turn any POAP you own into a polished, shareable attendance receipt backed by the onchain ERC-1155 record and the original event artwork.
          </p>
        </div>

        {!address || status === "no-wallet" ? (
          <div className="card mt-10 max-w-xl p-10 text-center">
            <p className="font-bold">Connect the wallet that holds your POAPs.</p>
            <p className="mt-2 text-sm text-ink/50">We will show the attendance proofs available to that wallet.</p>
            <div className="mt-4"><ConnectWallet /></div>
          </div>
        ) : status === "loading" ? (
          <div className="card mt-10 p-10 text-center text-ink/50">Reading your POAPs from Base…</div>
        ) : owned.length === 0 ? (
          <div className="card mt-10 max-w-xl p-10 text-center">
            <p className="font-black">No proof cards yet.</p>
            <p className="mt-2 text-sm text-ink/50">Once this wallet owns a POAP, its proof card will appear here.</p>
            <Link href="/events" className="mt-5 inline-flex text-sm font-black text-accent">Explore events →</Link>
          </div>
        ) : (
          <section className="mt-10">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">YOUR VERIFIABLE PROOFS</p>
                <h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Choose a POAP to open its proof card</h2>
              </div>
              <span className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/50">
                {owned.length} available
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {owned.map((id, index) => {
                const uriResult = uris?.[index];
                const meta = uriResult?.status === "success" && typeof uriResult.result === "string" ? decodeTokenUri(uriResult.result) : null;
                return (
                  <Link key={id.toString()} href={`/proof/${id}`} className="card group overflow-hidden p-4 transition hover:-translate-y-1 hover:border-accent/40">
                    <div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-ink/5">
                      <POAPArtwork
                        imageDataUri={meta?.image}
                        alt={meta?.name || `POAP #${id.toString()}`}
                        className="flex h-full w-full items-center justify-center p-3 [&_svg]:max-h-full [&_svg]:max-w-full"
                        fallback={<span className="text-xs text-ink/30">POAP #{id.toString()}</span>}
                      />
                    </div>
                    <div className="mt-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-black">{meta?.name || `POAP #${id.toString()}`}</h3>
                        <p className="mt-1 text-xs text-ink/45">Verified ownership card</p>
                      </div>
                      <span className="text-lg font-black text-accent">↗</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
      <Footer />
    </main>
  );
}
