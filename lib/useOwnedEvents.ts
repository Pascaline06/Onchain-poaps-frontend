"use client";
import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { POAP_ABI } from "./abi";
import { contractAddress } from "./contract";

export interface OwnedEventsResult {
  status: "no-wallet" | "loading" | "partial-failure" | "ready";
  owned: bigint[];
  refetch: () => void;
}

/**
 * Shared ownership-reading logic, factored out of the Gallery page so the
 * Passport doesn't duplicate it and risk drifting out of sync — in
 * particular the distinction between "still loading" and "confirmed zero"
 * that Gallery already had to learn the hard way (a failed read used to
 * look identical to a real zero balance).
 */
export function useOwnedEvents(): OwnedEventsResult {
  const { address, chainId } = useAccount();

  const { data: total } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "totalEvents",
    query: { enabled: Boolean(chainId) },
  });

  const ids = useMemo(
    () => (total !== undefined ? Array.from({ length: Number(total) + 1 }, (_, i) => BigInt(i)) : []),
    [total]
  );

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

  const balancesChecked = balances !== undefined;
  const anyReadFailed = balances?.some((r) => r.status !== "success") ?? false;

  const owned = useMemo(
    () => ids.filter((_, i) => balances?.[i]?.status === "success" && (balances[i].result as bigint) > 0n),
    [ids, balances]
  );

  const status: OwnedEventsResult["status"] = !address
    ? "no-wallet"
    : !balancesChecked
    ? "loading"
    : anyReadFailed
    ? "partial-failure"
    : "ready";

  return { status, owned, refetch };
}
