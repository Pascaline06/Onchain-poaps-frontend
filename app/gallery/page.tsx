"use client";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
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

  const { data: balances, refetch } = useReadContracts({
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

  // "Haven't checked yet" and "checked and you own nothing" used to be the
  // same code path — balances undefined and balances all-failed both
  // filtered down to an empty owned[] array, so a transient RPC hiccup
  // (rate limiting, a dropped request) looked identical to "you genuinely
  // don't own any POAPs." That's exactly backwards: silently telling
  // someone they own nothing because a read failed is worse than an error
  // message they can retry.
  const balancesChecked = balances !== undefined;
  const anyReadFailed = balances?.some((r) => r.status !== "success") ?? false;

  const owned = ids.filter((_, i) => balances?.[i]?.status === "success" && (balances[i].result as bigint) > 0n);

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
        ) : !balancesChecked ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-ink/50">Reading your balances from the contract…</p>
          </div>
        ) : anyReadFailed ? (
          <div className="card p-8 text-center">
            <p className="mb-2 text-ink/70">
              Some balance reads didn't come back — likely a temporary RPC hiccup, not that you own
              nothing. Showing {owned.length} confirmed POAP{owned.length === 1 ? "" : "s"} below; there
              may be more that just didn't load yet.
            </p>
            <button type="button" onClick={() => refetch()} className="btn-secondary mt-2 text-sm">
              Retry the failed reads
            </button>
            {owned.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {owned.map((id) => (
                  <POAPCard key={id.toString()} eventId={id} />
                ))}
              </div>
            )}
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
      <Footer />
    </main>
  );
}
