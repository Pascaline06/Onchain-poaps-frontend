"use client";
import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "./abi";
import { contractAddress } from "./contract";
import { fetchMintLogsForEvents } from "./mintLogs";

export interface Traveler {
  address: `0x${string}`;
  sharedEventIds: bigint[];
}

// "checking-holdings" and "no-holdings" are deliberately separate states —
// collapsing them into a single "not loading yet" state was the exact bug
// that made the page briefly claim "you haven't minted anything" while it
// was still waiting on the very first read to come back, before flipping
// to the real loading state a moment later.
export type FellowTravelersStatus =
  | "checking-holdings"
  | "no-holdings"
  | "loading-travelers"
  | "ready"
  | "error";

export interface FellowTravelersResult {
  status: FellowTravelersStatus;
  error: string | null;
  myEventIds: bigint[];
  eventNames: Map<string, string>;
  travelers: Traveler[]; // sorted by sharedEventIds.length descending
}

/**
 * Finding "what did I mint" is cheap: hasClaimed(eventId, me) for every
 * event is a plain batched read, no log scanning needed. Finding "who else
 * minted the same things" genuinely requires log history, since there's no
 * onchain enumeration of an event's holders beyond a headcount — but by
 * that point we're only fetching logs for the handful of events *this*
 * wallet actually holds, not the whole contract's history, which keeps the
 * expensive part small regardless of how large the contract grows.
 */
export function useFellowTravelers(): FellowTravelersResult {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const [logResult, setLogResult] = useState<{
    status: "loading-travelers" | "ready" | "error";
    error: string | null;
    travelers: Traveler[];
  }>({ status: "loading-travelers", error: null, travelers: [] });

  const { data: total } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "totalEvents",
    query: { enabled: Boolean(chainId) },
  });

  const allIds = useMemo(
    () => (total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)) : []),
    [total]
  );

  const { data: claimedResults } = useReadContracts({
    contracts:
      address && chainId
        ? allIds.map((id) => ({
            address: contractAddress(chainId),
            abi: POAP_ABI,
            functionName: "hasClaimed" as const,
            args: [id, address] as const,
          }))
        : [],
    query: { enabled: Boolean(address && chainId && allIds.length > 0) },
  });

  // Distinguishes "the hasClaimed batch hasn't resolved yet" from
  // "it resolved and found nothing" — those are different states even
  // though both can momentarily look like an empty myEventIds array.
  const holdingsChecked = claimedResults !== undefined;

  const myEventIds = useMemo(() => {
    if (!claimedResults) return [];
    return allIds.filter((id, i) => claimedResults[i]?.status === "success" && claimedResults[i]?.result === true);
  }, [claimedResults, allIds]);

  const { data: myEventsData } = useReadContracts({
    contracts:
      chainId && myEventIds.length > 0
        ? myEventIds.map((id) => ({
            address: contractAddress(chainId),
            abi: POAP_ABI,
            functionName: "events" as const,
            args: [id] as const,
          }))
        : [],
    query: { enabled: Boolean(chainId && myEventIds.length > 0) },
  });

  const eventNames = useMemo(() => {
    const map = new Map<string, string>();
    myEventsData?.forEach((r, i) => {
      if (r.status === "success" && r.result) {
        map.set(myEventIds[i].toString(), (r.result as readonly [string, ...unknown[]])[0]);
      }
    });
    return map;
  }, [myEventsData, myEventIds]);

  useEffect(() => {
    if (!publicClient || !address || !chainId || myEventIds.length === 0) {
      return;
    }

    let cancelled = false;
    setLogResult({ status: "loading-travelers", error: null, travelers: [] });

    (async () => {
      try {
        // One shared queue and concurrency limit across every event this
        // wallet holds — not a separate pool per event, which is what
        // multiplied into "over rate limit" errors against a free public
        // RPC in practice.
        const perEventResults = await fetchMintLogsForEvents(publicClient, contractAddress(chainId), myEventIds);
        if (cancelled) return;

        const overlapByAddress = new Map<string, Set<string>>(); // lowercase address -> set of eventId strings
        myEventIds.forEach((eventId) => {
          for (const { recipient } of perEventResults.get(eventId.toString()) ?? []) {
            if (recipient.toLowerCase() === address.toLowerCase()) continue;
            const key = recipient.toLowerCase();
            if (!overlapByAddress.has(key)) overlapByAddress.set(key, new Set());
            overlapByAddress.get(key)!.add(eventId.toString());
          }
        });

        const travelers: Traveler[] = Array.from(overlapByAddress.entries())
          .map(([addr, eventIdSet]) => ({
            address: addr as `0x${string}`,
            sharedEventIds: Array.from(eventIdSet).map(BigInt),
          }))
          .sort((a, b) => b.sharedEventIds.length - a.sharedEventIds.length);
        setLogResult({ status: "ready", error: null, travelers });
      } catch (err) {
        if (cancelled) return;
        setLogResult({
          status: "error",
          error: err instanceof Error ? err.message : "Couldn't read mint history from the chain.",
          travelers: [],
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [publicClient, address, chainId, myEventIds]);

  const status: FellowTravelersStatus = !holdingsChecked
    ? "checking-holdings"
    : myEventIds.length === 0
    ? "no-holdings"
    : logResult.status;

  return {
    status,
    error: logResult.error,
    myEventIds,
    eventNames,
    travelers: logResult.travelers,
  };
}
