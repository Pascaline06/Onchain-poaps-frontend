"use client";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { POAPCard } from "@/components/POAPCard";

export default function Home() {
  const { chainId } = useAccount();
  const { data: total } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "totalEvents",
    query: { enabled: Boolean(chainId) },
  });

  const ids = total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)).reverse() : [];

  return (
    <main>
      <Nav />
      <section className="px-6 py-16 text-center">
        <h1 className="font-display text-4xl font-bold sm:text-5xl">
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

      <section className="px-6 pb-16">
        <h2 className="mb-4 font-display text-xl font-semibold">Explore</h2>
        {!chainId && <p className="text-ink/50">Connect a wallet to browse events.</p>}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ids.map((id) => (
            <POAPCard key={id.toString()} eventId={id} />
          ))}
        </div>
      </section>
    </main>
  );
}
