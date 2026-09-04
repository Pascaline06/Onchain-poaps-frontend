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
 * mark itself, then the small print underneath it. The artwork sits inside
 * a rotated ink-ring frame (the same visual language as the .stamp class
 * used elsewhere) rather than a plain square, on purpose — a passport
 * entry should read as a stamp pressed onto the page, not a product
 * thumbnail in a grid.
 *
 * Purely presentational — see usePassportEntryData for where the data
 * comes from, shared with the canvas export so both read the same
 * resolved values.
 */
export function PassportEntry({ data, entryNumber }: { data: PassportEntryData; entryNumber: number }) {
  const { name, eventDate, location, image, loaded } = data;
  // Alternate tilt per entry so a spread doesn't look like two identical
  // stamps stamped at the same angle — real ink stamps never land twice
  // exactly the same way.
  const tilt = entryNumber % 2 === 0 ? "rotate-3" : "-rotate-3";

  if (!loaded) {
    return <div className="h-72 animate-pulse rounded-2xl bg-ink/5" />;
  }

  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      <span className="mb-3 font-mono text-[10px] uppercase tracking-widest text-ink/35">
        Entry No. {String(entryNumber).padStart(3, "0")}
      </span>
      <div className={`flex h-40 w-40 items-center justify-center rounded-full border-[3px] border-accent p-3 sm:h-48 sm:w-48 ${tilt}`} style={{ boxShadow: "inset 0 0 0 1px rgb(255 90 31 / 0.25)" }}>
        <div className={tilt === "rotate-3" ? "-rotate-3" : "rotate-3"}>
          <POAPArtwork
            imageDataUri={image}
            alt={name || "POAP"}
            className="flex h-28 w-28 items-center justify-center sm:h-36 sm:w-36 [&_svg]:max-h-full [&_svg]:max-w-full"
            fallback={<div className="h-28 w-28 rounded-full border-2 border-dashed border-ink/15 sm:h-36 sm:w-36" />}
          />
        </div>
      </div>
      <p className="mt-4 font-display text-lg font-semibold leading-tight">{name || "Untitled POAP"}</p>
      <p className="mt-1 text-xs text-ink/50">
        {[location, formatEventDate(eventDate)].filter(Boolean).join(" · ") || "No date or location given"}
      </p>
    </div>
  );
}
