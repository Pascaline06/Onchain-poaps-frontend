"use client";
import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWallet } from "@/components/ConnectWallet";
import { PassportEntry } from "@/components/PassportEntry";
import { useOwnedEvents } from "@/lib/useOwnedEvents";
import { usePassportEntryData } from "@/lib/usePassportEntryData";
import { exportPassportSpread } from "@/lib/exportPassportSpread";
function Cover({ count, opening, onOpen }: { count: number; opening: boolean; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={opening}
      className={`group relative w-full overflow-hidden rounded-3xl border-4 border-ink bg-ink p-16 text-center shadow-2xl transition-transform hover:-translate-y-1 ${
        opening ? "passport-cover-open" : ""
      }`}
    >
      <div className="pointer-events-none absolute inset-4 rounded-2xl border border-white/10" />
      <span className="stamp mb-6 inline-flex text-xs">ONCHAIN POAPS</span>
      <p className="font-display text-3xl font-bold text-white sm:text-4xl">Passport</p>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-white/40">
        {count} stamp{count === 1 ? "" : "s"} collected
      </p>
      <p className="mt-8 text-sm text-white/50 transition-colors group-hover:text-white/80">
        {opening ? "Opening…" : "Tap to open →"}
      </p>
    </button>
  );
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
      <div className="passport-page-turn overflow-hidden rounded-3xl border-4 border-ink bg-paper shadow-2xl">
        <div className="grid grid-cols-1 divide-y divide-ink/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          {leftId !== undefined && <PassportEntry data={leftData} entryNumber={leftNum} />}
          {rightId !== undefined && <PassportEntry data={rightData} entryNumber={rightNum} />}
        </div>
      </div>
      <div className="mt-4 flex justify-center">
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

export default function PassportPage() {
  const { status, owned } = useOwnedEvents();
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [turning, setTurning] = useState(false);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);

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

  function openCover() {
    setOpening(true);
    // Matches the 0.45s cover-open animation duration in globals.css —
    // the cover swings away before the first spread mounts underneath it.
    setTimeout(() => {
      setOpened(true);
      setOpening(false);
    }, 450);
  }

  return (
    <main>
      <Nav />
      <div className="mx-auto max-w-3xl px-6 py-16 text-center">
        <span className="stamp mb-6 inline-flex text-xs">YOUR PASSPORT</span>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Your Passport</h1>
        <p className="mx-auto mt-4 max-w-xl text-ink/60">
          Every POAP you hold, laid out the way a real passport reads — one stamp per entry, oldest
          first, page by page.
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
        ) : !opened ? (
          <Cover count={owned.length} opening={opening} onOpen={openCover} />
        ) : owned.length === 0 ? (
          <div className="card flex flex-col items-center gap-2 p-10 text-center">
            <p className="text-ink/60">Nothing stamped yet — mint a POAP and it'll show up here.</p>
            <a href="/" className="btn-secondary mt-3 text-sm">
              Go find one to mint
            </a>
          </div>
        ) : (
          <>
            {!turning && <Spread leftId={leftId} rightId={rightId} leftNum={clampedIndex * 2 + 1} rightNum={clampedIndex * 2 + 2} />}
            {turning && <div className="passport-page-turn h-72 rounded-3xl border-4 border-ink bg-paper shadow-2xl" />}

            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setOpened(false)}
                className="text-xs text-ink/40 underline hover:text-ink/70"
              >
                ← Cover
              </button>
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
