"use client";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { parseAddressList } from "@/lib/merkle";
import { InfoTip } from "./InfoTip";

export function CreatorBatchMint({ eventId }: { eventId: bigint }) {
  const { chainId } = useAccount();
  const [raw, setRaw] = useState("");
  const { writeContract, isPending, data: hash, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addresses = parseAddressList(raw).filter((a) => a.startsWith("0x") && a.length === 42) as `0x${string}`[];

  return (
    <div className="card space-y-3 p-4">
      <p className="font-semibold">
        Direct airdrop (creator mint)
        <InfoTip title="Creator mint">
          You directly mint the POAP to specific wallets, no proof or signature needed from them — useful
          for a known guest list. Limited to 101 addresses per transaction and only within the 30-day
          creator window. Addresses that already claimed are skipped, not rejected.
        </InfoTip>
      </p>
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={"0x1234...\n0xabcd..."}
        rows={4}
        className="w-full rounded-xl border border-ink/10 bg-ink/5 p-2 font-mono text-xs"
      />
      <p className="text-xs text-ink/50">{addresses.length} valid address{addresses.length === 1 ? "" : "es"} detected (max 101 per call).</p>
      <button
        className="btn-primary"
        disabled={addresses.length === 0 || addresses.length > 101 || isPending || isMining}
        onClick={() =>
          chainId &&
          writeContract({
            address: contractAddress(chainId),
            abi: POAP_ABI,
            functionName: "creatorMint",
            args: [eventId, addresses],
          })
        }
      >
        {isPending || isMining ? "Minting to list…" : `Mint to ${addresses.length} addresses`}
      </button>
      {error && <p className="text-sm text-red-400">{error.message}</p>}
      {isSuccess && <p className="text-sm text-accent2">Sent.</p>}
    </div>
  );
}
