"use client";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { HeroStack } from "@/components/HeroStack";
import { ExploreSection } from "@/components/ExploreSection";

export default function Home() {
  return (
    <main>
      <Nav />

      <section className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 px-6 py-16 sm:py-24 lg:grid-cols-2">
        <div className="order-2 text-center lg:order-1 lg:text-left">
          <span className="stamp mb-6 inline-flex text-xs">EST. ONCHAIN</span>
          <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Proof you were there. <span className="text-accent">Forever.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-md text-lg text-ink/60 lg:mx-0">
            Everything about your POAP — the artwork, the metadata, all of it — gets written directly
            into the smart contract when you register it. There's no IPFS pin that can expire, no
            backend server that can go offline, and no company that can decide to switch it off. As long
            as Base exists, so does your proof that you were there.
          </p>
          <a href="/register" className="btn-primary mt-8 inline-block text-base">
            Create a POAP
          </a>
        </div>
        <div className="order-1 lg:order-2">
          <HeroStack />
        </div>
      </section>

      <section className="border-y border-ink/10 bg-ink/[0.02] px-6 py-16">
        <h2 className="text-center font-display text-3xl font-semibold tracking-tight">How it works</h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-ink/60">
          Four steps between having nothing and holding a real, verifiable POAP in your wallet — no
          signup, and no dashboard you need to come back and check on afterward.
        </p>
        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              n: "01",
              title: "Register",
              body: "Upload your event's artwork as an SVG and it's written straight into the contract the moment you register — nothing pinned to a service that could quietly disappear later.",
            },
            {
              n: "02",
              title: "Distribute",
              body: "Choose how people claim it: leave it open to anyone, restrict it to an approved list of addresses, or generate a signed link that turns into a QR code for minting on the spot at your event.",
            },
            {
              n: "03",
              title: "Mint",
              body: "Whoever's claiming a POAP connects a wallet and confirms one transaction — no account to set up first, nothing else standing in the way.",
            },
            {
              n: "04",
              title: "Collect",
              body: "Every mint shows up in a real, browsable gallery, and anyone can independently verify it on BaseScan or OpenSea — not just take our word for it.",
            },
          ].map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm text-accent">{step.n}</span>
              <h3 className="mt-2 font-display text-lg font-semibold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <ExploreSection />

      <Footer />
    </main>
  );
}
