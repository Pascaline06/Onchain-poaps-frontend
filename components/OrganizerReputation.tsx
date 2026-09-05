import { shortAddress } from "@/lib/links";

export function organizerActivityScore(events: number, attendees: number) {
  if (events <= 0 && attendees <= 0) return 0;
  return Math.min(999, Math.round(events * 88 + Math.min(attendees, 500) * 1.7));
}

export function OrganizerReputation({ creator, events, attendees }: { creator: string; events: number; attendees: number }) {
  const score = organizerActivityScore(events, attendees);
  const tier = score >= 800 ? "Established Organizer" : score >= 500 ? "Proven Organizer" : score >= 250 ? "Active Organizer" : score > 0 ? "Emerging Organizer" : "No activity yet";
  return <div className="card reference-panel p-5"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Organizer reputation</p><p className="mt-2 font-mono text-sm font-bold">{shortAddress(creator)}</p><p className="mt-1 text-xs leading-5 text-ink/50">{tier}. The score is a transparent participation heuristic using only events created and POAP claims visible onchain. It is not financial reputation and does not change contract permissions.</p></div><div className="text-right"><div className="text-4xl font-black tracking-[-.05em] text-accent">{score}</div><div className="eyebrow">activity score</div></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{width:`${Math.min(100, score/10)}%`}}/></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><span className="text-ink/45">Events created</span><strong className="ml-2">{events}</strong></div><div><span className="text-ink/45">POAP claims</span><strong className="ml-2">{attendees}</strong></div></div></div>;
}
