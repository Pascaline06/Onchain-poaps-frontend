"use client";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { OnchainHero } from "@/components/OnchainHero";
import { ExploreSection } from "@/components/ExploreSection";

const steps = [
  ["01", "Register", "Write your event, metadata and original artwork directly into the contract."],
  ["02", "Distribute", "Use public minting, an allowlist, or signed links and QR flows."],
  ["03", "Collect", "Attendees mint a real ERC-1155 proof that becomes part of their passport."],
  ["04", "Verify", "Anyone can inspect the event, holder and transaction independently onchain."],
];

export default function Home() {
  return <main><Nav/><OnchainHero/>
    <section className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-end">
        <div><p className="eyebrow text-accent">THE BIG IDEA</p><h2 className="mt-3 max-w-xl text-4xl font-black tracking-[-.04em] sm:text-5xl">Attendance is more than a collectible.</h2></div>
        <p className="max-w-2xl text-base font-medium leading-7 text-ink/60 sm:text-lg">Onchain POAPs turns every event into a permanent record and every attendee into a traveler with a history. Explore events, build your passport, discover people you crossed paths with, and prove you were there.</p>
      </div>
      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([n,t,b])=><div key={n} className="card p-5"><span className="font-mono text-xs font-bold text-accent">{n}</span><h3 className="mt-5 text-xl font-black">{t}</h3><p className="mt-2 text-sm font-medium leading-6 text-ink/55">{b}</p></div>)}</div>
    </section>
    <section className="mx-auto max-w-7xl px-6 pb-16"><div className="grid gap-4 lg:grid-cols-3"><Link href="/passport" className="card group p-6 hover:-translate-y-1 hover:border-accent/40"><p className="eyebrow text-accent">EVENT PASSPORT</p><h3 className="mt-3 text-2xl font-black tracking-[-.035em]">Turn attendance into a journey.</h3><p className="mt-3 text-sm font-medium leading-6 text-ink/55">Open a permanent passport of every POAP you hold, with event stamps, locations, organizers and your Journey Orbit.</p><span className="mt-6 inline-flex text-sm font-black text-accent">Open Passport →</span></Link><Link href="/travelers" className="card group p-6 hover:-translate-y-1 hover:border-accent/40"><p className="eyebrow text-accent">TRAVELER NETWORK</p><h3 className="mt-3 text-2xl font-black tracking-[-.035em]">See who showed up with you.</h3><p className="mt-3 text-sm font-medium leading-6 text-ink/55">Discover fellow travelers from verified mint history and turn isolated collectibles into an attendance network.</p><span className="mt-6 inline-flex text-sm font-black text-accent">Meet Travelers →</span></Link><Link href="/organizer" className="card group p-6 hover:-translate-y-1 hover:border-accent/40"><p className="eyebrow text-accent">COMMAND CENTER</p><h3 className="mt-3 text-2xl font-black tracking-[-.035em]">Run events like a real product.</h3><p className="mt-3 text-sm font-medium leading-6 text-ink/55">Manage public minting, allowlists, signature QR distribution, kiosk mode, claims and organizer reputation.</p><span className="mt-6 inline-flex text-sm font-black text-accent">Organizer Dashboard →</span></Link></div></section>
    <section className="bg-[#050505] px-6 py-16 text-white sm:py-20"><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center"><div><p className="eyebrow text-[#ff6b1a]">BUILT FOR PERMANENCE</p><h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-6xl">No disappearing<br/><span className="text-[#ff6b1a]">attendance.</span></h2><p className="mt-6 max-w-xl text-white/55">Artwork and event metadata are stored by the protocol onchain. The frontend is a window into the record — not the place where the record lives.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-6"><div className="text-4xl font-black">∞</div><div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/40">Permanent proof</div></div><div className="rounded-2xl border border-white/10 bg-white/5 p-6"><div className="text-4xl font-black">1</div><div className="mt-2 text-xs font-bold uppercase tracking-widest text-white/40">Onchain source</div></div><div className="col-span-2 rounded-2xl border border-[#ff6b1a]/30 bg-[#ff6b1a]/10 p-6"><p className="font-mono text-xs uppercase tracking-widest text-[#ff6b1a]">Your passport is waiting</p><p className="mt-2 text-2xl font-black">Connect → collect → remember.</p><Link href="/passport" className="mt-5 inline-flex rounded-xl bg-[#ff6b1a] px-5 py-3 text-sm font-black">Open Passport</Link></div></div></div></section>
    <ExploreSection/>
    <Footer/>
  </main>;
}
