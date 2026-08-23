"use client";
import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { computeTiming } from "@/lib/time";
import { InfoTip } from "./InfoTip";
import { Countdown } from "./Countdown";

interface EventData {
  name: string; isPublic: boolean; isSoulbound: boolean;
  allowlistRoot: `0x${string}`; createdAt: bigint; creator: `0x${string}`;
}

/**
 * Surfaces every minting method the contract currently allows for this
 * event, and only that method — no dead buttons for a mint path that isn't
 * live. This is the "clearly explain which minting methods are available,
 * who can use them, and any time restrictions" requirement.
 */
export function MintPanel({ eventId, evt }: { eventId: bigint; evt: EventData }) {
  const { address, chainId } = useAccount();
  const [proofInput, setProofInput] = useState("");
  const [signatureInput, setSignatureInput] = useState("");

  const timing = computeTiming(evt.createdAt);
  const hasAllowlist = evt.allowlistRoot !== ("0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`) && evt.allowlistRoot !== ("0x0" as `0x${string}`);

  const { data: alreadyClaimed } = useReadContract({
    address: chainId ? contractAddress(chainId) : undefined,
    abi: POAP_ABI,
    functionName: "hasClaimed",
    args: address ? [eventId, address] : undefined,
    query: { enabled: Boolean(address && chainId) },
  });

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isMining, isSuccess } = useWaitForTransactionReceipt({ hash });

  const parsedProof = useMemo(() => {
    try {
      const arr = JSON.parse(proofInput);
      if (Array.isArray(arr) && arr.every((x) => typeof x === "string")) return arr as `0x${string}`[];
    } catch {}
    return null;
  }, [proofInput]);

  if (alreadyClaimed) {
    return (
      <div className="card p-6 text-center">
        <p className="text-accent2">You've already minted this POAP.</p>
        <a href="/gallery" className="text-sm underline text-ink/60">
          View it in your gallery →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {evt.isPublic && (
        <div className="card space-y-2 p-4">
          <p className="font-semibold">Public mint <span className="pill bg-accent2/20 text-accent2">open to anyone</span></p>
          <button
            className="btn-primary w-full"
            disabled={!address || isPending || isMining}
            onClick={() =>
              chainId &&
              writeContract({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "mint", args: [eventId] })
            }
          >
            {isPending || isMining ? "Minting…" : "Mint (public)"}
          </button>
        </div>
      )}

      {hasAllowlist && (
        <div className="card space-y-2 p-4">
          <p className="font-semibold">
            Allowlist mint
            <InfoTip title="Allowlist minting">
              The creator picked a specific set of addresses that can mint. If you're on the list, they
              (or a page like this) should have given you a "proof" — a short piece of data that proves
              your address is in the list without revealing the whole list. Paste it below.
            </InfoTip>
          </p>
          <textarea
            value={proofInput}
            onChange={(e) => setProofInput(e.target.value)}
            placeholder='Paste your proof, e.g. ["0xabc...", "0xdef..."]'
            rows={3}
            className="w-full rounded-xl border border-ink/10 bg-ink/5 p-2 font-mono text-xs"
          />
          <button
            className="btn-primary w-full"
            disabled={!address || !parsedProof || isPending || isMining}
            onClick={() =>
              chainId &&
              parsedProof &&
              writeContract({
                address: contractAddress(chainId),
                abi: POAP_ABI,
                functionName: "allowlistMint",
                args: [eventId, parsedProof],
              })
            }
          >
            {isPending || isMining ? "Minting…" : "Mint (allowlist)"}
          </button>
          {proofInput && !parsedProof && <p className="text-xs text-red-400">That doesn't look like a valid proof array.</p>}
        </div>
      )}

      {timing.signatureWindowOpen && (
        <div className="card space-y-2 p-4">
          <p className="font-semibold">
            Signature mint <Countdown createdAt={evt.createdAt} kind="signature" />
            <InfoTip title="Signature minting">
              The creator can hand out a unique code (often via a QR poster at a live event) that proves
              they authorized your specific wallet to mint. Paste the signature they gave you — it only
              works for your connected address.
            </InfoTip>
          </p>
          <input
            value={signatureInput}
            onChange={(e) => setSignatureInput(e.target.value)}
            placeholder="0x… signature from the creator"
            className="w-full rounded-xl border border-ink/10 bg-ink/5 p-2 font-mono text-xs"
          />
          <button
            className="btn-primary w-full"
            disabled={!address || !signatureInput.startsWith("0x") || isPending || isMining}
            onClick={() =>
              chainId &&
              writeContract({
                address: contractAddress(chainId),
                abi: POAP_ABI,
                functionName: "mintWithSignature",
                args: [eventId, signatureInput as `0x${string}`],
              })
            }
          >
            {isPending || isMining ? "Minting…" : "Mint (signature)"}
          </button>
        </div>
      )}

      {!evt.isPublic && !hasAllowlist && !timing.signatureWindowOpen && (
        <p className="card p-4 text-sm text-ink/60">
          No minting method is currently open for this POAP. The creator hasn't enabled public minting,
          there's no allowlist set, and the signature-mint window (37 days after registration) has
          closed.
        </p>
      )}

      {!address && <p className="text-center text-sm text-ink/50">Connect a wallet to mint.</p>}
      {error && <p className="text-sm text-red-400">{error.message}</p>}
      {isSuccess && (
        <p className="text-center text-sm text-accent2">
          Minted! Check{" "}
          <a className="underline" target="_blank" rel="noreferrer" href={`https://testnets.opensea.io/assets/base-sepolia/${chainId ? contractAddress(chainId) : ""}/${eventId}`}>
            OpenSea
          </a>{" "}
          or{" "}
          <a className="underline" target="_blank" rel="noreferrer" href={`https://sepolia.basescan.org/tx/${hash}`}>
            BaseScan
          </a>
          .
        </p>
      )}
    </div>
  );
}
