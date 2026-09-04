"use client";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { POAPCard } from "@/components/POAPCard";
import { ConnectWallet } from "@/components/ConnectWallet";
import { useOwnedEvents } from "@/lib/useOwnedEvents";

export default function GalleryPage() {
  const { status, owned, refetch } = useOwnedEvents();

  return (
    <main>
      <Nav />
      <div className="px-6 py-12">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="mb-2 font-display text-3xl font-bold">Your collection</h1>
            <p className="text-ink/60">
              Every POAP here is a real ERC-1155 balance read live from the contract — this isn't a
              cached list, it's what you actually own right now.
            </p>
          </div>
          {owned.length > 0 && (
            <a href="/passport" className="btn-secondary shrink-0 text-sm">
              Open as passport →
            </a>
          )}
        </div>

        {status === "no-wallet" ? (
          <div className="card p-8 text-center">
            <p className="mb-4 text-ink/60">Connect a wallet to see your POAPs.</p>
            <ConnectWallet />
          </div>
        ) : status === "loading" ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-ink/50">Reading your balances from the contract…</p>
          </div>
        ) : status === "partial-failure" ? (
          <div className="card p-8 text-center">
            <p className="mb-2 text-ink/70">
              Some balance reads didn't come back — likely a temporary RPC hiccup, not that you own
              nothing. Showing {owned.length} confirmed POAP{owned.length === 1 ? "" : "s"} below; there
              may be more that just didn't load yet.
            </p>
            <button type="button" onClick={() => refetch()} className="btn-secondary mt-2 text-sm">
              Retry the failed reads
            </button>
            {owned.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {owned.map((id) => (
                  <POAPCard key={id.toString()} eventId={id} />
                ))}
              </div>
            )}
          </div>
        ) : owned.length === 0 ? (
          <p className="text-ink/50">No POAPs yet — go mint one from the explore page.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {owned.map((id) => (
              <POAPCard key={id.toString()} eventId={id} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
