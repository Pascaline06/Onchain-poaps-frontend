"use client";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { computeTiming, formatCountdown } from "@/lib/time";

export function PublicMintToggle({ eventId, isPublic, createdAt }: { eventId: bigint; isPublic: boolean; createdAt: bigint }) {
  const { chainId } = useAccount();
  const { writeContract, isPending, data: hash } = useWriteContract();
  const { isLoading: isMining } = useWaitForTransactionReceipt({ hash });
  const timing = computeTiming(createdAt);

  const toggle = (next: boolean) =>
    chainId &&
    writeContract({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "updateEventPublic",
      args: [eventId, next],
    });

  return (
    <div className="card space-y-2 p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">
          Public minting is currently{" "}
          <span className={isPublic ? "text-accent2" : "text-ink/50"}>{isPublic ? "OPEN" : "closed"}</span>
        </p>
        <span className="pill bg-ink/10 text-ink/60">
          {timing.creatorWindowOpen ? `Editable for ${formatCountdown(timing.creatorSecondsLeft)}` : "Locked (30-day window passed)"}
        </span>
      </div>
      <div className="flex gap-3">
        <button className="btn-secondary" disabled={!timing.creatorWindowOpen || isPublic || isPending || isMining} onClick={() => toggle(true)}>
          Open public minting
        </button>
        <button className="btn-secondary" disabled={!timing.creatorWindowOpen || !isPublic || isPending || isMining} onClick={() => toggle(false)}>
          Close public minting
        </button>
      </div>
    </div>
  );
}
