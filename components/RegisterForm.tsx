"use client";
import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEventLogs } from "viem";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { toFlags } from "@/lib/flags";
import { SvgDropzone } from "./SvgDropzone";
import { InfoTip } from "./InfoTip";

export function RegisterForm() {
  const { address, chainId } = useAccount();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [externalUrl, setExternalUrl] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [svg, setSvg] = useState("");
  const [isSoulbound, setIsSoulbound] = useState(true);
  const [isPublic, setIsPublic] = useState(false);

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { data: receipt, isLoading: isMining } = useWaitForTransactionReceipt({ hash });

  const newEventId = (() => {
    if (!receipt) return null;
    try {
      const logs = parseEventLogs({ abi: POAP_ABI, logs: receipt.logs, eventName: "NewEvent" });
      return logs[0]?.args.eventId ?? null;
    } catch {
      return null;
    }
  })();

  const canSubmit = address && chainId && name.trim().length > 0 && name.length <= 128 && svg.trim().length > 0;

  const submit = () => {
    if (!chainId || !canSubmit) return;
    const eventDateUnix = eventDate ? BigInt(Math.floor(new Date(eventDate).getTime() / 1000)) : 0n;
    writeContract({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "registerEvent",
      args: [
        name,
        description,
        eventDateUnix,
        location,
        "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        svg,
        externalUrl,
        toFlags(isSoulbound, isPublic),
      ],
    });
  };

  if (newEventId !== null) {
    return (
      <div className="card space-y-3 p-6">
        <p className="text-lg font-display text-accent">POAP #{newEventId.toString()} registered 🎉</p>
        <p className="text-sm text-ink/70">
          It's live onchain now. You have 30 days to open public minting and/or set an allowlist root, and
          37 days total for signature-based mints.
        </p>
        <a href={`/event/${newEventId}/manage`} className="btn-primary inline-block">
          Configure distribution →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium text-ink/80">Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={128}
          placeholder="ETHGlobal Lagos 2026"
          className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 text-sm"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-ink/80">Description (optional, max 512 chars)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={512}
          rows={3}
          className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-ink/80">Location (optional)</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            maxLength={128}
            placeholder="Lagos, Nigeria — or 'Virtual'"
            className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-ink/80">Event date (optional)</label>
          <input
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-ink/80">External URL (optional, max 128 chars)</label>
        <input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          maxLength={128}
          placeholder="https://your-event.xyz"
          className="mt-1 w-full rounded-xl border border-ink/10 bg-ink/5 p-3 text-sm"
        />
      </div>

      <SvgDropzone value={svg} onChange={setSvg} />

      <div className="card space-y-4 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Soulbound (non-transferable)
            <InfoTip title="Soulbound vs transferable">
              Soulbound means the POAP is bound to the wallet that minted it — it can never be sent,
              sold, or transferred, only burned. Most attendance badges should be soulbound: it proves
              <em> that wallet</em> was there, not just that someone owns the token now. Turn this off
              only if you specifically want a tradeable collectible.
            </InfoTip>
          </span>
          <input type="checkbox" checked={isSoulbound} onChange={(e) => setIsSoulbound(e.target.checked)} className="h-5 w-5" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Enable public minting immediately
            <InfoTip title="Public minting">
              Anyone with a wallet can mint one, no allowlist or signature needed. You can also leave
              this off and open it later (within 30 days), or use only allowlist/signature minting
              instead — good for gated or in-person events where you don't want randoms minting.
            </InfoTip>
          </span>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} className="h-5 w-5" />
        </div>
        <p className="text-xs text-ink/50">
          You can add an allowlist or generate signature-mint links after registering — those don't need
          to be decided right now, and the allowlist root can only be set once, so we handle that as a
          separate step on the next screen rather than rushing you into it here.
        </p>
      </div>

      <button onClick={submit} disabled={!canSubmit || isPending || isMining} className="btn-primary w-full">
        {isPending ? "Confirm in wallet…" : isMining ? "Registering onchain…" : "Register POAP"}
      </button>

      {!address && <p className="text-center text-sm text-ink/50">Connect a wallet to register a POAP.</p>}
      {error && <p className="text-sm text-red-400">{error.message}</p>}
    </div>
  );
}
