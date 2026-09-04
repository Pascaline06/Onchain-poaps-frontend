"use client";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OnchainHero } from "@/components/OnchainHero";
import { ExploreSection } from "@/components/ExploreSection";

const steps = [
  ["01", "Register", "Create the event, metadata and original SVG artwork directly through the contract."],
  ["02", "Distribute", "Choose public minting, allowlists, signatures or QR flows for live events."],
  ["03", "Collect", "Attendees mint a real ERC-1155 proof and build a permanent Event Passport."],
  ["04", "Verify", "Ownership, event data and the original artwork can be independently verified onchain."],
];

export default function Home() {
  return (
    <main>
      <div className="reference-top-shell"><Nav/><OnchainHero/></div>

      <section className="reference-section">
        <div className="reference-section-heading">
          <div>
            <p className="reference-kicker accent-kicker">THE BIG IDEA</p>
            <h2>Attendance becomes identity.</h2>
          </div>
          <p>Onchain POAPs turns every event into a permanent record and every attendee into a traveler with a history. It is a practical minting product and a living attendance network.</p>
        </div>
        <div className="reference-step-grid">
          {steps.map(([n,t,b]) => (
            <div key={n} className="reference-card reference-step-card">
              <span className="reference-index">{n}</span>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="reference-section reference-feature-section">
        <div className="reference-feature-grid">
          <Link href="/passport" className="reference-card reference-feature-card">
            <p className="reference-kicker accent-kicker">EVENT PASSPORT</p>
            <h3>Your attendance, assembled into one journey.</h3>
            <p>Open your permanent passport, event stamps, locations, organizers and Journey Orbit.</p>
            <span>OPEN PASSPORT →</span>
          </Link>
          <Link href="/travelers" className="reference-card reference-feature-card">
            <p className="reference-kicker accent-kicker">TRAVELER NETWORK</p>
            <h3>See the people who showed up with you.</h3>
            <p>Discover fellow travelers from verified mint history instead of isolated collectible cards.</p>
            <span>MEET TRAVELERS →</span>
          </Link>
          <Link href="/organizer" className="reference-card reference-feature-card">
            <p className="reference-kicker accent-kicker">COMMAND CENTER</p>
            <h3>Create, distribute and manage real events.</h3>
            <p>Control public minting, allowlists, signature QR distribution, kiosk mode, claims and reputation.</p>
            <span>OPEN DASHBOARD →</span>
          </Link>
        </div>
      </section>

      <section className="reference-dark-band">
        <div className="reference-dark-band-copy">
          <p className="reference-kicker">BUILT FOR PERMANENCE</p>
          <h2>No disappearing attendance.</h2>
          <p>The protocol is the record. This frontend is the experience around it — fast enough for a live event, clear enough for a first-time minter and verifiable after the event is over.</p>
        </div>
        <div className="reference-dark-metrics">
          <div><strong>∞</strong><span>Permanent proof</span></div>
          <div><strong>1</strong><span>Onchain source</span></div>
          <Link href="/passport"><strong>→</strong><span>Open Passport</span></Link>
        </div>
      </section>

      <ExploreSection/>
      <Footer/>
    </main>
  );
}
