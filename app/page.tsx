"use client";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { POAPCard } from "@/components/POAPCard";
import { HeroStack } from "@/components/HeroStack";

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

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="stamp mb-6 inline-flex text-xs">EST. ONCHAIN</span>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Proof you were there. <span className="text-accent">Forever.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-ink/60 lg:mx-0">
            No IPFS pin to lose. No backend to go down. No company to shut it off. Your artwork lives in
            the same place your transaction does.
          </p>
          <a href="/register" className="btn-primary mt-8 inline-block text-base">
            Create a POAP
          </a>
        </div>
        <div className="order-1 lg:order-2">
          <HeroStack />
        </div>
      </section>

      <section className="border-y border-ink/10 bg-ink/[0.02] px-6 py-16">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-ink/60">
          Four steps. No signup, no dashboard to check back on.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              title: "Register",
              body: "Drop in your SVG. It's written straight into the contract — nothing to pin, nothing to lose.",
            },
            {
              n: "02",
              title: "Distribute",
              body: "Open it to anyone, gate it to a list, or sign one QR code that mints on the spot at your event.",
            },
            {
              n: "03",
              title: "Mint",
              body: "One tap, one transaction. No account to make first.",
            },
            {
              n: "04",
              title: "Collect",
              body: "It shows up in a real gallery — and on OpenSea and BaseScan, for anyone checking your work.",
            },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm text-accent">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-8 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Explore</h2>
          <span className="font-mono text-xs text-ink/40">
            {total !== undefined ? `${Number(total) + 1} onchain` : ""}
          </span>
        </div>
        {ids.length === 0 && (
          <p className="text-ink/50">No POAPs registered yet on this contract — be the first.</p>
        )}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {ids.map((id) => (
            <POAPCard key={id.toString()} eventId={id} />
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
