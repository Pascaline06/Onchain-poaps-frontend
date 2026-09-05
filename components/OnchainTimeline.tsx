"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";

function formatDate(value: bigint) {
  if (!value || value <= 0n) return "Date not set";
  const d = new Date(Number(value) * 1000);
  if (Number.isNaN(d.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(d);
}

export function OnchainTimeline({ eventIds }: { eventIds: bigint[] }) {
  const { chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;
  const { data: reads } = useReadContracts({
    contracts: eventIds.map((id) => ({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "events" as const, args: [id] as const })),
    query: { enabled: eventIds.length > 0 },
  });

  const items = useMemo(() => eventIds.map((id, index) => {
    const result = reads?.[index];
    if (result?.status !== "success" || !result.result) return null;
    const event = result.result as any;
    return { id, name: event[0] || `Event #${id}`, date: BigInt(event[2] ?? 0), location: event[3] || "Location not set", creator: event[6] as string };
  }).filter(Boolean).sort((a, b) => Number((a as any).date - (b as any).date)) as { id: bigint; name: string; date: bigint; location: string; creator: string }[], [eventIds, reads]);

  if (!eventIds.length) return null;

  return <section id="onchain-timeline" className="timeline-shell scroll-mt-24">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="eyebrow text-accent">ONCHAIN TIMELINE</p><h3 className="mt-2 text-2xl font-black tracking-[-.035em]">Your history, in order.</h3></div>
      <span className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-ink/45">{items.length} verified stops</span>
    </div>
    <div className="timeline-track mt-7">
      {items.map((item, index) => <Link key={item.id.toString()} href={`/event/${item.id}`} className="timeline-item group">
        <div className="timeline-marker"><span>{String(index + 1).padStart(2, "0")}</span></div>
        <div className="timeline-card">
          <div className="flex flex-wrap items-center justify-between gap-2"><small>{formatDate(item.date)}</small><span>EVENT #{item.id.toString()}</span></div>
          <h4>{item.name}</h4>
          <p>{item.location}</p>
          <em>Open permanent record →</em>
        </div>
      </Link>)}
    </div>
  </section>;
}
