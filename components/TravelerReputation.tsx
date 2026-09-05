"use client";

export function travelerActivityScore(events: number, locations: number, organizers: number, fellowTravelers: number) {
  return Math.min(999, events * 58 + locations * 72 + organizers * 46 + Math.min(fellowTravelers, 30) * 7);
}

export function TravelerReputation({ events, locations, organizers, fellowTravelers }: { events: number; locations: number; organizers: number; fellowTravelers: number }) {
  const score = travelerActivityScore(events, locations, organizers, fellowTravelers);
  const tier = score >= 700 ? "Seasoned Traveler" : score >= 420 ? "Connected Traveler" : score >= 180 ? "Active Traveler" : "New Traveler";
  return <section id="traveler-reputation" className="traveler-reputation-card scroll-mt-24">
    <div className="traveler-reputation-copy">
      <p className="eyebrow text-accent">TRAVELER REPUTATION</p>
      <h3>{tier}</h3>
      <p>This score measures participation only — event diversity, organizer diversity, places attended and verified shared-event history. It never uses token prices, wallet balance or NFT value.</p>
      <div className="traveler-score-breakdown">
        <span><b>{events}</b> events</span><span><b>{locations}</b> locations</span><span><b>{organizers}</b> organizers</span><span><b>{fellowTravelers}</b> fellow travelers</span>
      </div>
    </div>
    <div className="traveler-score-orb"><strong>{score}</strong><span>participation score</span></div>
  </section>;
}
