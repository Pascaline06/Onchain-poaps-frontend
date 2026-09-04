"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { POAPCard } from "./POAPCard";

type StatusFilter = "all" | "public" | "allowlist" | "soulbound";
const PAGE_SIZE = 8;
const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000";

/**
 * Search, filter, and page through registered POAPs — real pagination
 * instead of one long grid, because a jam-packed unbroken list is exactly
 * the "looks unfinished" problem worth fixing. Names/flags for every event
 * are fetched in a single batched multicall (not one request per card) so
 * filtering and search work against the full set, not just what's already
 * scrolled into view.
 */
export function ExploreSection() {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(0);

  const { data: total } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "totalEvents",
  });

  const allIds = useMemo(
    () => (total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)) : []),
    [total]
  );

  const { data: allEvents } = useReadContracts({
    contracts: allIds.map((id) => ({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "events" as const,
      args: [id] as const,
    })),
    query: { enabled: allIds.length > 0 },
  });

  const filteredIds = useMemo(() => {
    if (!allEvents) return [];
    const q = query.trim().toLowerCase();
    const matches: bigint[] = [];
    allEvents.forEach((result, i) => {
      if (result.status !== "success" || !result.result) return;
      const [name, , , location, allowlistRoot, , , , , isSoulbound, isPublic] = result.result as readonly [
        string, string, bigint, string, `0x${string}`, `0x${string}`, string, bigint, string, boolean, boolean
      ];
      if (q && !name.toLowerCase().includes(q) && !location.toLowerCase().includes(q) && !allIds[i].toString().includes(q)) {
        return;
      }
      if (status === "public" && !isPublic) return;
      if (status === "allowlist" && allowlistRoot === ZERO_ROOT) return;
      if (status === "soulbound" && !isSoulbound) return;
      matches.push(allIds[i]);
    });
    return matches.reverse(); // newest first
  }, [allEvents, allIds, query, status]);

  const pageCount = Math.max(1, Math.ceil(filteredIds.length / PAGE_SIZE));
  const clampedPage = Math.min(page, pageCount - 1);
  const pageIds = filteredIds.slice(clampedPage * PAGE_SIZE, clampedPage * PAGE_SIZE + PAGE_SIZE);

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "public", label: "Public mint open" },
    { key: "allowlist", label: "Allowlist" },
    { key: "soulbound", label: "Soulbound" },
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-8 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-semibold tracking-tight">Explore</h2>
        <span className="font-mono text-xs text-ink/40">
          {total !== undefined ? `${Number(total) + 1} onchain` : ""}
        </span>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search by name, location, or event ID"
          className="w-full rounded-xl border border-ink/15 bg-white/60 px-4 py-2.5 text-sm sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => {
                setStatus(f.key);
                setPage(0);
              }}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                status === f.key ? "border-accent bg-accent/10 text-accent" : "border-ink/15 text-ink/60 hover:border-ink/30"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {allIds.length === 0 && (
        <p className="text-ink/50">No POAPs registered yet on this contract — be the first.</p>
      )}
      {allIds.length > 0 && filteredIds.length === 0 && (
        <p className="text-ink/50">Nothing matches that search or filter.</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {pageIds.map((id) => (
          <POAPCard key={id.toString()} eventId={id} />
        ))}
      </div>

      {filteredIds.length > PAGE_SIZE && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={clampedPage === 0}
            className="btn-secondary text-sm disabled:opacity-30"
          >
            ← Previous
          </button>
          <span className="rounded-full bg-ink/10 px-4 py-2 font-mono text-sm font-bold text-ink">
            Page {clampedPage + 1} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={clampedPage >= pageCount - 1}
            className="btn-secondary text-sm disabled:opacity-30"
          >
            Next →
          </button>
        </div>
      )}
    </section>
  );
}
