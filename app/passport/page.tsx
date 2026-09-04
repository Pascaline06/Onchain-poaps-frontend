"use client";
import { useState } from "react";
import { useAccount } from "wagmi";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PassportEntry } from "@/components/PassportEntry";
import { useOwnedEvents } from "@/lib/useOwnedEvents";
import { usePassportEntryData } from "@/lib/usePassportEntryData";
import { exportPassportSpread } from "@/lib/exportPassportSpread";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function Spread({ leftId, rightId, leftNum, rightNum }: { leftId?: bigint; rightId?: bigint; leftNum: number; rightNum: number }) {
  const leftData = usePassportEntryData(leftId);
  const rightData = usePassportEntryData(rightId);
  const [exporting, setExporting] = useState(false);

  const entries = [
    leftId !== undefined ? { data: leftData, entryNumber: leftNum } : null,
    rightId !== undefined ? { data: rightData, entryNumber: rightNum } : null,
  ].filter((e): e is { data: typeof leftData; entryNumber: number } => e !== null);

  return (
    <div>
      {/* Stacked pages behind the visible spread, suggesting a book with
          real depth rather than a single flat card. */}
      <div className="relative">
        <div className="absolute inset-x-3 -bottom-2 h-full rounded-3xl border-2 border-ink/10 bg-paper" />
        <div className="absolute inset-x-1.5 -bottom-1 h-full rounded-3xl border-2 border-ink/15 bg-paper" />
        <div className="passport-page-turn relative overflow-hidden rounded-3xl border-4 border-ink bg-paper shadow-2xl">
          <div className="relative grid grid-cols-1 sm:grid-cols-2">
            {leftId !== undefined && <PassportEntry data={leftData} entryNumber={leftNum} />}
            {rightId !== undefined && <PassportEntry data={rightData} entryNumber={rightNum} />}
            {/* The binding: a visible spine down the center on wider
                screens, a stitched divider on narrow ones. */}
            <div
              className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-6 -translate-x-1/2 sm:block"
              style={{
                background: "linear-gradient(90deg, rgba(11,13,16,0) 0%, rgba(11,13,16,0.12) 45%, rgba(11,13,16,0.12) 55%, rgba(11,13,16,0) 100%)",
              }}
            />
            <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 border-l-2 border-dashed border-ink/20 sm:block" />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          disabled={exporting || entries.some((e) => !e.data.loaded)}
          onClick={async () => {
            setExporting(true);
            try {
              await exportPassportSpread(entries, `passport-spread-${leftNum}-${rightNum}.png`);
            } finally {
              setExporting(false);
            }
          }}
          className="btn-secondary text-sm disabled:opacity-40"
        >
          {exporting ? "Exporting…" : "Export this page"}
        </button>
      </div>
    </div>
  );
}

function Cover({ onOpen, count }: { onOpen: () => void; count: number }) {
  const { address } = useAccount();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative mx-auto block w-full max-w-sm overflow-hidden rounded-3xl border-4 border-ink bg-ink p-10 text-center shadow-2xl transition-transform hover:-translate-y-1"
    >
      <div className="absolute inset-x-3 -bottom-2 -z-10 h-full rounded-3xl border-2 border-ink/40 bg-ink" />
      <div className="absolute inset-x-1.5 -bottom-1 -z-10 h-full rounded-3xl border-2 border-ink/60 bg-ink" />
      <span className="relative mx-auto mb-6 inline-flex -rotate-6 items-center justify-center rounded-full border-[3px] border-paper px-4 py-2 font-display text-xs text-paper" style={{ boxShadow: "inset 0 0 0 1px rgb(250 247 240 / 0.3)" }}>
        {count} STAMPS
      </span>
      <p className="font-display text-2xl font-bold text-paper">Onchain Passport</p>
      <p className="mt-2 font-mono text-xs tracking-widest text-paper/50">
        {address ? truncateAddress(address) : ""}
      </p>
      <p className="mt-8 text-sm text-paper/60 transition-colors group-hover:text-accent">Tap to open →</p>
    </button>
  );
}

export default function PassportPage() {
  const { status, owned } = useOwnedEvents();
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [coverOpen, setCoverOpen] = useState(false);
  const [turning, setTurning] = useState(false);

  // Chronological-ish ordering by event ID, oldest first — the first page
  // of a real passport is your earliest stamp, not your most recent one.
  const ordered = [...owned].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  const spreadCount = Math.max(1, Math.ceil(ordered.length / 2));
  const clampedIndex = Math.min(spreadIndex, spreadCount - 1);
  const leftId = ordered[clampedIndex * 2];
  const rightId = ordered[clampedIndex * 2 + 1];

  function turnTo(next: number) {
    setTurning(true);
    setSpreadIndex(Math.max(0, Math.min(spreadCount - 1, next)));
    setTimeout(() => setTurning(false), 500);
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <span className="stamp mb-6 inline-flex text-xs">YOUR PASSPORT</span>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your Passport</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Not another list of what you own — every POAP laid out the way a real passport reads: one
          stamp per entry, oldest first, a page you actually turn.
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-6 pb-20">
        {status === "no-wallet" ? (
          <div className="card flex flex-col items-center gap-4 p-10 text-center">
            <p className="text-ink/60">Connect a wallet to see your passport.</p>
            <ConnectWallet />
          </div>
        ) : status === "loading" ? (
          <div className="card flex flex-col items-center gap-3 p-10 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm text-ink/50">Reading your collection…</p>
          </div>
        ) : owned.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <p className="text-ink/60">Nothing stamped yet — mint a POAP and it'll show up here.</p>
            <a href="/" className="btn-secondary mt-3 text-sm">
              Go find one to mint
            </a>
          </div>
        ) : !coverOpen ? (
          <Cover onOpen={() => setCoverOpen(true)} count={owned.length} />
        ) : (
          <>
            {!turning && <Spread leftId={leftId} rightId={rightId} leftNum={clampedIndex * 2 + 1} rightNum={clampedIndex * 2 + 2} />}
            {turning && <div className="passport-page-turn h-72 rounded-3xl border-4 border-ink bg-paper shadow-2xl" />}

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => turnTo(clampedIndex - 1)}
                disabled={clampedIndex === 0}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                ← Previous page
              </button>
              <span className="rounded-full bg-ink/10 px-4 py-2 font-mono text-sm font-bold text-ink">
                Page {clampedIndex + 1} of {spreadCount}
              </span>
              <button
                type="button"
                onClick={() => turnTo(clampedIndex + 1)}
                disabled={clampedIndex >= spreadCount - 1}
                className="btn-secondary text-sm disabled:opacity-30"
              >
                Next page →
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </main>
  );
}
