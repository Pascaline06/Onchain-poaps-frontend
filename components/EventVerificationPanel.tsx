import { shortAddress } from "@/lib/links";

export function EventVerificationPanel({ eventId, creator, supply, isSoulbound, isPublic, hasAllowlist, metadataPresent }: { eventId: bigint; creator: string; supply: number; isSoulbound: boolean; isPublic: boolean; hasAllowlist: boolean; metadataPresent: boolean }) {
  const checks = [
    ["Contract event", `#${eventId.toString()} exists`],
    ["Onchain metadata", metadataPresent ? "Decoded from token URI" : "Metadata pending"],
    ["Ownership model", isSoulbound ? "Soulbound" : "Transferable"],
    ["Distribution", isPublic ? "Public mint enabled" : hasAllowlist ? "Allowlist configured" : "Signature / creator flow"],
    ["Claims", `${supply.toLocaleString()} minted`],
    ["Creator", shortAddress(creator)],
  ];
  return <section className="event-proof-ledger">
    <div><p className="eyebrow text-accent">EVENT PROOF LEDGER</p><h3>What can be verified without trusting this UI.</h3><p>The page turns contract state into a readable proof checklist. Each status comes from the supplied Onchain POAPs contract or its token URI.</p></div>
    <div className="event-proof-checks">{checks.map(([label, value]) => <div key={label}><span className="event-proof-check">✓</span><p><small>{label}</small><strong>{value}</strong></p></div>)}</div>
  </section>;
}
