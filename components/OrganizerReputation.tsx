import { shortAddress } from "@/lib/links";

export function organizerActivityScore(events: number, attendees: number) {
  return Math.min(999, 100 + events * 80 + Math.min(attendees, 500) * 2);
}

export function OrganizerReputation({ creator, events, attendees }: { creator: string; events: number; attendees: number }) {
  const score = organizerActivityScore(events, attendees);
  const tier = score >= 800 ? "Legendary Organizer" : score >= 500 ? "Trusted Organizer" : score >= 250 ? "Active Organizer" : "Emerging Organizer";
  return <div className="card reference-panel p-5"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Organizer reputation</p><p className="mt-2 font-mono text-sm font-bold">{shortAddress(creator)}</p><p className="mt-1 text-xs leading-5 text-ink/50">{tier}. Activity score is a transparent heuristic based only on events created and POAP claims visible onchain.</p></div><div className="text-right"><div className="text-4xl font-black tracking-[-.05em] text-accent">{score}</div><div className="eyebrow">activity score</div></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-accent" style={{width:`${Math.min(100, score/10)}%`}}/></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><span className="text-ink/45">Events created</span><strong className="ml-2">{events}</strong></div><div><span className="text-ink/45">POAP claims</span><strong className="ml-2">{attendees}</strong></div></div></div>;
}
