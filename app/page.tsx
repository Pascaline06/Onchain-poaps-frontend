"use client";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { POAPCard } from "@/components/POAPCard";

export default function Home() {
  // Browsing is a public, read-only action — it shouldn't require connecting a
  // wallet first. This app only ever targets one chain, so there's no reason
  // to wait on a connected wallet's chainId just to fetch totalEvents(): fall
  // back to DEFAULT_CHAIN so the first thing anyone sees (wallet or not) is
  // real events, not a "connect to continue" wall.
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const { data: total } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "totalEvents",
  });

  const ids = total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)).reverse() : [];

  return (
    <main>
      <Nav />
      <section className="px-6 py-16 text-center">
        <span className="stamp mb-6 inline-flex text-xs">EST. ONCHAIN</span>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">
          Proof you were there. <span className="text-accent">Forever.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Fully onchain Proof of Attendance tokens on Base. No IPFS, no backend, no dead links — every
          pixel of every badge lives on the blockchain itself.
        </p>
        <a href="/register" className="btn-primary mt-6 inline-block">
          Create a POAP
        </a>
      </section>

      <section className="border-y border-ink/10 bg-ink/[0.02] px-6 py-14">
        <h2 className="text-center font-display text-2xl font-semibold">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
          Four steps, no backend, nothing that can go down or get taken away.
        </p>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              title: "Register",
              body: "Upload your event's artwork as SVG. It's stored directly onchain — no IPFS pin that can vanish.",
            },
            {
              n: "02",
              title: "Distribute",
              body: "Pick how people claim it: open to everyone, an allowlist, or a signed QR code for a live event.",
            },
            {
              n: "03",
              title: "Mint",
              body: "Attendees connect a wallet and claim their POAP in one transaction. No account, no signup.",
            },
            {
              n: "04",
              title: "Collect",
              body: "Every POAP shows up in a real gallery, verifiable on BaseScan and OpenSea, forever.",
            },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm text-accent">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-ink/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <h2 className="mb-4 font-display text-xl font-semibold">Explore</h2>
        {ids.length === 0 && (
          <p className="text-ink/50">No POAPs registered yet on this contract — be the first.</p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ids.map((id) => (
            <POAPCard key={id.toString()} eventId={id} />
          ))}
        </div>
      </section>
    </main>
  );
}
