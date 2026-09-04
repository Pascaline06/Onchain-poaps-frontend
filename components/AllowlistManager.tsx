"use client";
import { useMemo, useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { buildAllowlist, parseAddressList, type AllowlistBuildResult } from "@/lib/merkle";
import { InfoTip } from "./InfoTip";

const ZERO_ROOT = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

/**
 * Takes a creator from "I have a list of addresses" to "my allowlist is
 * configured" without ever mentioning a Merkle tree by name in a required
 * field. Root-setting is one-time and time-limited on the contract, so this
 * component makes the irreversible step ("Set root onchain") a distinct,
 * deliberate action after the (freely repeatable) build/preview step.
 */
export function AllowlistManager({ eventId, currentRoot, rootAlreadySet }: { eventId: bigint; currentRoot: `0x${string}`; rootAlreadySet: boolean }) {
  const { chainId } = useAccount();
  const [raw, setRaw] = useState("");
  const [built, setBuilt] = useState<AllowlistBuildResult | null>(null);
  const [buildError, setBuildError] = useState<string | null>(null);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const addressCount = useMemo(() => parseAddressList(raw).length, [raw]);

  const runBuild = () => {
    setBuildError(null);
    try {
      setBuilt(buildAllowlist(parseAddressList(raw)));
    } catch (e) {
      setBuilt(null);
      setBuildError(e instanceof Error ? e.message : "Couldn't build the allowlist.");
    }
  };

  const downloadProofs = () => {
    if (!built) return;
    const blob = new Blob([JSON.stringify(built.proofs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poap-${eventId}-allowlist-proofs.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (rootAlreadySet) {
    return (
      <div className="card p-4">
        <p className="font-semibold">Allowlist root is set</p>
        <p className="mt-1 break-all font-mono text-xs text-ink/60">{currentRoot}</p>
        <p className="mt-2 text-sm text-ink/60">
          This is permanent — the contract only allows setting the root once. If you need to add or
          remove people, register a new POAP event instead.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card space-y-2 p-4 text-sm text-ink/70">
        <p className="font-semibold text-ink">
          How this works
          <InfoTip title="Merkle allowlist, in plain terms">
            Instead of storing every address onchain (expensive, and public), we compress your whole
            list down into one short "root" value and store only that. Each person on the list gets a
            small personal "proof" that lets them show — without revealing the rest of the list — that
            they belong to it. You generate everything below in your browser; nothing leaves your
            device except the final root and the proofs you choose to share.
          </InfoTip>
        </p>
        <p>
          Paste one address per line (or comma-separated). We'll build the list locally, show you a
          preview, and only write the root onchain when you click "Set allowlist root" — that step is
          the one you can't undo, so check the preview first.
        </p>
      </div>

      <div>
        <label className="text-sm font-medium text-ink/80">Recipient addresses ({addressCount} detected)</label>
        <textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder={"0x1234...\n0xabcd...\n0x5678..."}
          rows={6}
          className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 font-mono text-xs"
        />
      </div>

      <button onClick={runBuild} className="btn-secondary" disabled={addressCount === 0}>
        Build allowlist ({addressCount} addresses)
      </button>
      {buildError && <p className="text-sm text-red-400">{buildError}</p>}

      {built && (
        <div className="card space-y-3 p-4">
          <p className="text-sm">
            Root: <span className="break-all font-mono text-xs text-accent2">{built.root}</span>
          </p>
          <p className="text-sm text-ink/60">{built.addresses.length} unique valid addresses included.</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={downloadProofs} className="btn-secondary text-sm">
              Download proofs.json to distribute
            </button>
            <button
              className="btn-primary text-sm"
              disabled={isPending || isMining}
              onClick={() =>
                chainId &&
                writeContract({
                  address: contractAddress(chainId),
                  abi: POAP_ABI,
                  functionName: "updateAllowlistRoot",
                  args: [eventId, built.root],
                })
              }
            >
              {isPending || isMining ? "Setting root onchain…" : "Set allowlist root (permanent)"}
            </button>
          </div>
          <p className="text-xs text-ink/50">
            Send each recipient their own entry from proofs.json (their address maps to their proof
            array), or build a per-recipient mint link — see the docs for a ready-made link format each
            person can just click.
          </p>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error.message}</p>}
      {isSuccess && <p className="text-sm text-accent2">Allowlist root set onchain. Recipients can now mint.</p>}
    </div>
  );
}
