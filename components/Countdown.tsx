"use client";
import { computeTiming, formatCountdown } from "@/lib/time";

export function Countdown({ createdAt, kind }: { createdAt: bigint; kind: "creator" | "signature" }) {
  const t = computeTiming(createdAt);
  const open = kind === "creator" ? t.creatorWindowOpen : t.signatureWindowOpen;
  const secondsLeft = kind === "creator" ? t.creatorSecondsLeft : t.signatureSecondsLeft;
  return (
    <span className={`pill ${open ? "bg-accent2/20 text-accent2" : "bg-ink/10 text-ink/50"}`}>
      {kind === "creator" ? "Creator controls" : "Signature minting"}: {formatCountdown(secondsLeft)}
    </span>
  );
}
