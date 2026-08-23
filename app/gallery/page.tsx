"use client";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { POAPCard } from "@/components/POAPCard";
import { ConnectWallet } from "@/components/ConnectWallet";

export default function GalleryPage() {
  const { address, chainId } = useAccount();

  const { data: total } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "totalEvents",
    query: { enabled: Boolean(chainId) },
  });

  const ids = total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)) : [];

  const { data: balances } = useReadContracts({
    contracts: chainId
      ? ids.map((id) => ({
          address: contractAddress(chainId),
          abi: POAP_ABI,
          functionName: "balanceOf" as const,
          args: address ? [address, id] : undefined,
        }))
      : [],
    query: { enabled: Boolean(address && chainId && ids.length > 0) },
  });

  const owned = ids.filter((_, i) => balances?.[i]?.result && (balances[i].result as bigint) > 0n);

  return (
    <main>
      <Nav />
      <div className="px-6 py-12">
        <h1 className="mb-2 font-display text-3xl font-bold">Your collection</h1>
        <p className="mb-8 text-ink/60">
          Every POAP here is a real ERC-1155 balance read live from the contract — this isn't a cached
          list, it's what you actually own right now.
        </p>

        {!address ? (
          <div className="card p-8 text-center">
            <p className="mb-4 text-ink/60">Connect a wallet to see your POAPs.</p>
            <ConnectWallet />
          </div>
        ) : owned.length === 0 ? (
          <p className="text-ink/50">No POAPs yet — go mint one from the explore page.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {owned.map((id) => (
              <POAPCard key={id.toString()} eventId={id} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
