import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";

export function Footer() {
  const explorerUrl = `https://sepolia.basescan.org/address/${contractAddress(DEFAULT_CHAIN.id)}`;
  return (
    <footer className="border-t border-ink/15 bg-ink/[0.03] px-6 py-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <span className="flex h-7 w-7 -rotate-6 items-center justify-center rounded-full border-2 border-accent text-[10px] font-bold text-accent">
                OP
              </span>
              <span>Onchain <span className="text-accent">POAPs</span></span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">
              Create permanent attendance proofs, collect them into an onchain passport, and verify the record directly from Base.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-8 text-sm sm:grid-cols-3 lg:gap-x-12">
            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-ink/60">App</p>
              <div className="flex flex-col gap-2.5 font-medium text-ink/80">
                <a href="/register" className="transition-colors hover:text-accent">Create a POAP</a>
                <a href="/events" className="transition-colors hover:text-accent">Explore Events</a>
                <a href="/gallery" className="transition-colors hover:text-accent">Gallery</a>
                <a href="/passport" className="transition-colors hover:text-accent">Event Passport</a>
                <a href="/travelers" className="transition-colors hover:text-accent">Traveler Network</a>
                <a href="/organizer" className="transition-colors hover:text-accent">Organizer Command Center</a>
                <a href="/docs" className="transition-colors hover:text-accent">Docs</a>
              </div>
            </div>

            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-ink/60">Built in</p>
              <div className="flex flex-col gap-2.5 font-medium text-ink/80">
                <a href="/passport#journey-orbit" className="transition-colors hover:text-accent">Journey Atlas</a>
                <a href="/passport#onchain-timeline" className="transition-colors hover:text-accent">Onchain Timeline</a>
                <a href="/travelers#traveler-reputation" className="transition-colors hover:text-accent">Traveler Reputation</a>
                <a href="/organizer#organizer-reputation" className="transition-colors hover:text-accent">Organizer Reputation</a>
                <a href="/organizer#organizer-analytics" className="transition-colors hover:text-accent">Organizer Analytics</a>
                <a href="/proof" className="transition-colors hover:text-accent">POAP Proof Cards</a>
                <a href="/docs#signature" className="transition-colors hover:text-accent">QR & Signature Minting</a>
                <a href="/docs#allowlist" className="transition-colors hover:text-accent">Allowlist Tools</a>
              </div>
            </div>

            <div>
              <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-ink/60">Verify</p>
              <div className="flex flex-col gap-2.5 font-medium text-ink/80">
                <a href="/gallery" className="transition-colors hover:text-accent">Verify a POAP</a>
                <a href="/proof" className="transition-colors hover:text-accent">Share Proof Card</a>
                <a href={explorerUrl} target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">Contract on BaseScan</a>
                <a href="https://github.com/jvaleskadevs/onchain-poaps" target="_blank" rel="noreferrer" className="transition-colors hover:text-accent">Protocol source</a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-ink/10 pt-6">
          <p className="text-sm font-medium text-ink/60">
            Running on Base Sepolia testnet. Fully open source under the MIT license — fork it, redeploy it, make it yours.
          </p>
        </div>
      </div>
    </footer>
  );
}
