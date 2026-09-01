"use client";
import type { PassportEntryData } from "@/lib/usePassportEntryData";
import { POAPArtwork } from "./POAPArtwork";

export function formatEventDate(unixSeconds: bigint): string {
  if (unixSeconds === 0n) return "";
  const d = new Date(Number(unixSeconds) * 1000);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

/**
 * One visa-stamp entry in the passport — an event's artwork plus its name,
 * date, and location, laid out the way an actual passport stamp reads: the
 * mark itself, then the small print underneath it. Purely presentational —
 * see usePassportEntryData for where the data comes from, shared with the
 * canvas export so both read the same resolved values.
 */
export function PassportEntry({ data, entryNumber }: { data: PassportEntryData; entryNumber: number }) {
  const { name, eventDate, location, image, loaded } = data;

  if (!loaded) {
    return <div className="h-72 animate-pulse rounded-2xl bg-ink/5" />;
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      <span className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/35">
        Entry No. {String(entryNumber).padStart(3, "0")}
      </span>
      <div className="flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        <POAPArtwork
          imageDataUri={image}
          alt={name || "POAP"}
          className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
          fallback={<div className="h-full w-full rounded-xl border-2 border-dashed border-ink/15" />}
        />
      </div>
      <p className="mt-4 font-display text-lg font-semibold leading-tight">{name || "Untitled POAP"}</p>
      <p className="mt-1 text-xs text-ink/50">
        {[location, formatEventDate(eventDate)].filter(Boolean).join(" · ") || "No date or location given"}
      </p>
    </div>
  );
}
