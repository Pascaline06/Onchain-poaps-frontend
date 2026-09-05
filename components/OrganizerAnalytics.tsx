"use client";

export interface OrganizerAnalyticsEvent {
  id: bigint;
  name: string;
  claims: number;
  isPublic: boolean;
  hasAllowlist: boolean;
  eventDate: bigint;
}

export function OrganizerAnalytics({ events }: { events: OrganizerAnalyticsEvent[] }) {
  const max = Math.max(1, ...events.map((e) => e.claims));
  const publicCount = events.filter((e) => e.isPublic).length;
  const allowlistCount = events.filter((e) => e.hasAllowlist).length;
  const top = [...events].sort((a, b) => b.claims - a.claims)[0];
  const total = events.reduce((n, e) => n + e.claims, 0);

  return <section id="organizer-analytics" className="organizer-analytics scroll-mt-24">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow text-accent">ORGANIZER ANALYTICS</p><h2 className="mt-2 text-2xl font-black tracking-[-.035em]">Portfolio signal, not vanity metrics.</h2></div><p className="max-w-md text-sm leading-relaxed text-ink/50">Every number below is derived from your events and claim counts visible through the contract.</p></div>
    <div className="organizer-analytics-grid mt-6">
      <div className="organizer-chart-card">
        <div className="flex items-center justify-between"><strong>Claims by event</strong><span>{total.toLocaleString()} total</span></div>
        <div className="organizer-bars">
          {events.length === 0 ? <p className="py-8 text-center text-sm text-ink/40">Create your first event to unlock analytics.</p> : events.slice(0, 8).map((event) => <div key={event.id.toString()} className="organizer-bar-row">
            <div className="organizer-bar-label"><span>{event.name}</span><b>{event.claims}</b></div>
            <div className="organizer-bar-track"><span style={{ width: `${Math.max(4, (event.claims / max) * 100)}%` }} /></div>
          </div>)}
        </div>
      </div>
      <div className="organizer-signal-card">
        <p className="eyebrow">Distribution mix</p>
        <div className="organizer-signal-ring" style={{ ["--public-share" as any]: `${events.length ? (publicCount / events.length) * 360 : 0}deg` }}><div><strong>{events.length}</strong><span>events</span></div></div>
        <div className="organizer-signal-list"><span><i className="bg-accent" />Public enabled <b>{publicCount}</b></span><span><i className="bg-ink/25" />Allowlist configured <b>{allowlistCount}</b></span><span><i className="bg-ink/10" />Top event <b>{top?.claims ?? 0} claims</b></span></div>
      </div>
    </div>
  </section>;
}
