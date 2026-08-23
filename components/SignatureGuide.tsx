"use client";
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { keccak256, encodePacked, isAddress, getAddress } from "viem";
import { QRCodeSVG } from "qrcode.react";
import { InfoTip } from "./InfoTip";

/**
 * Lets the creator generate a signature for one recipient at a time (or a
 * short batch), each producing a per-recipient link + QR code. This is what
 * makes signature minting actually usable at a live event: print the QR,
 * put it on a badge or screen, the attendee scans it, connects their
 * wallet, and the mint form is pre-filled with a signature that only works
 * for their address.
 */
export function SignatureGuide({ eventId, appUrl }: { eventId: bigint; appUrl: string }) {
  const { chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [recipient, setRecipient] = useState("");
  const [result, setResult] = useState<{ address: string; signature: string; link: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const generate = async () => {
    setError(null);
    if (!isAddress(recipient)) {
      setError("That's not a valid address.");
      return;
    }
    if (!chainId) {
      setError("Connect your wallet first.");
      return;
    }
    setBusy(true);
    try {
      // Must match Poap.sol exactly:
      // keccak256(abi.encodePacked(eventId, block.chainid, msg.sender))
      const packed = encodePacked(["uint256", "uint256", "address"], [eventId, BigInt(chainId), getAddress(recipient)]);
      const hash = keccak256(packed);
      const signature = await signMessageAsync({ message: { raw: hash } });
      const link = `${appUrl}/event/${eventId}?sig=${signature}&for=${getAddress(recipient)}`;
      setResult({ address: getAddress(recipient), signature, link });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Signing failed or was rejected.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card space-y-2 p-4 text-sm text-ink/70">
        <p className="font-semibold text-white">
          How signature minting works
          <InfoTip title="Signature minting, in plain terms">
            You (the creator) sign a short message that says "this exact wallet may mint this exact
            POAP." The recipient submits your signature along with their own mint transaction — the
            contract checks it was really you who signed it. No allowlist setup, no gas cost to you,
            and it works for people you didn't know in advance, which is exactly what you need at the
            door of a live event.
          </InfoTip>
        </p>
        <p>
          Valid for 37 days after you registered the POAP (30-day creator window + a 7-day grace
          period). Each signature is tied to one wallet address — you can't hand the same one to two
          different people.
        </p>
      </div>

      <div className="card space-y-3 p-4">
        <label className="text-sm font-medium text-ink/80">Recipient wallet address</label>
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className="w-full rounded-xl border border-ink/10 bg-ink/5 p-3 font-mono text-xs"
        />
        <button onClick={generate} disabled={busy} className="btn-primary w-full">
          {busy ? "Sign in wallet…" : "Generate signature + QR"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      {result && (
        <div className="card space-y-3 p-4">
          <p className="text-sm text-ink/70">
            For <span className="font-mono text-xs">{result.address}</span>:
          </p>
          <div className="flex justify-center rounded-xl bg-white p-4">
            <QRCodeSVG value={result.link} size={200} />
          </div>
          <p className="break-all rounded-lg bg-ink/5 p-2 font-mono text-[10px] text-ink/60">{result.link}</p>
          <button
            className="btn-secondary text-sm"
            onClick={() => navigator.clipboard.writeText(result.link)}
          >
            Copy link
          </button>
          <p className="text-xs text-ink/50">
            Print this QR on a badge, poster, or screen at your event, or send the link directly. Scanning
            or opening it takes the attendee straight to the mint page with this signature pre-filled —
            they just need to connect the matching wallet and confirm.
          </p>
        </div>
      )}
    </div>
  );
}
