import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";

export function Footer() {
  const explorerUrl = `https://sepolia.basescan.org/address/${contractAddress(DEFAULT_CHAIN.id)}`;
  return (
    <footer className="border-t border-ink/10 px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 font-display text-base font-bold">
            <span className="flex h-6 w-6 -rotate-6 items-center justify-center rounded-full border-2 border-accent text-[9px] font-bold text-accent">
              OP
            </span>
            <span>
              Onchain <span className="text-accent">POAPs</span>
            </span>
          </div>
          <p className="mt-3 text-sm text-ink/50">
            Built on a contract that stores every SVG onchain, on purpose — nothing here depends on a
            server staying up, including this frontend.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm sm:flex sm:gap-12">
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/40">App</p>
            <div className="flex flex-col gap-2 text-ink/70">
              <a href="/register" className="hover:text-accent">Create a POAP</a>
              <a href="/gallery" className="hover:text-accent">Gallery</a>
              <a href="/docs" className="hover:text-accent">Docs</a>
            </div>
          </div>
          <div>
            <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink/40">Verify</p>
            <div className="flex flex-col gap-2 text-ink/70">
              <a href={explorerUrl} target="_blank" rel="noreferrer" className="hover:text-accent">
                Contract on BaseScan
              </a>
              <a
                href="https://github.com/jvaleskadevs/onchain-poaps"
                target="_blank"
                rel="noreferrer"
                className="hover:text-accent"
              >
                Protocol source
              </a>
            </div>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-4xl text-xs text-ink/30">
        Base Sepolia testnet. Open source, MIT licensed. Deploy your own — nothing here is tied to us.
      </p>
    </footer>
  );
}
