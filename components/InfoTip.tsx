"use client";
import { useState } from "react";

/**
 * Small inline "what does this mean" explainer. Used everywhere a term like
 * "soulbound", "Merkle root", or "signature mint" appears for the first time
 * on a page, so creators and minters are never expected to already know the
 * vocabulary — the bounty is explicit that we shouldn't assume that.
 */
export function InfoTip({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Explain: ${title}`}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-ink/30 text-[10px] leading-none text-ink/70 hover:border-accent hover:text-accent"
      >
        i
      </button>
      {open && (
        <div className="absolute z-20 mt-2 w-72 -translate-x-1/2 rounded-xl border border-white/10 bg-ink p-3 text-sm shadow-xl">
          <p className="mb-1 font-semibold text-accent">{title}</p>
          <p className="text-white/80">{children}</p>
        </div>
      )}
    </span>
  );
}
