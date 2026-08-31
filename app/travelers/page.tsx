"use client";
import { useAccount } from "wagmi";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWallet } from "@/components/ConnectWallet";
import { TravelerConstellation } from "@/components/TravelerConstellation";
import { useFellowTravelers } from "@/lib/useFellowTravelers";

export default function TravelersPage() {
  const { address } = useAccount();
  const { status, error, myEventIds, eventNames, travelers } = useFellowTravelers();

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <span className="stamp mb-6 inline-flex text-xs">READ DIRECTLY FROM MINT LOGS</span>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Fellow Travelers</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          A POAP doesn't just prove you were somewhere — it proves other specific people were there
          too. This finds everyone whose passport got stamped alongside yours, straight from the
          onchain mint history, and lays them out around you by how much you actually overlap.
        </p>
      </div>

      <div className="mx-auto max-w-4xl px-6 pb-20">
        {!address ? (
          <div className="card flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-ink/60">Connect a wallet to find your fellow travelers.</p>
            <ConnectWallet />
          </div>
        ) : status === "checking-holdings" ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-ink/50">Checking what you've minted on this contract…</p>
          </div>
        ) : status === "no-holdings" ? (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <p className="text-ink/60">
              You haven't minted anything on this contract yet — travelers show up once you have.
            </p>
            <a href="/register" className="btn-secondary mt-3 text-sm">
              Go mint or create one
            </a>
          </div>
        ) : status === "loading-travelers" ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-ink/50">
              Reading mint history for {myEventIds.length} event{myEventIds.length === 1 ? "" : "s"} you hold —
              this walks real onchain logs, not a cached index, so it can take a moment.
            </p>
          </div>
        ) : status === "error" ? (
          <div className="card p-6 text-center text-sm text-red-600">
            {error ?? "Couldn't read mint history from the chain."}
          </div>
        ) : (
          <TravelerConstellation travelers={travelers} eventNames={eventNames} />
        )}
      </div>
      <Footer />
    </main>
  );
}
