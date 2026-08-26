"use client";
import { useCallback, useState } from "react";
import DOMPurify from "dompurify";
import { optimizeSvg } from "@/lib/svg";
import { InfoTip } from "./InfoTip";

interface Props {
  value: string;
  onChange: (svg: string) => void;
}

/**
 * Accepts a raw SVG (paste or file drop), previews it, and offers one-click
 * SVGO optimization before registration — the bounty asks for either an
 * in-app optimizer or a clear pointer to SVGO. We do the actual optimization
 * because every byte here is paid for onchain via SSTORE2.
 */
export function SvgDropzone({ value, onChange }: Props) {
  const [stats, setStats] = useState<{ before: number; after: number; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.name.endsWith(".svg") && file.type !== "image/svg+xml") {
        setError("That doesn't look like an .svg file.");
        return;
      }
      const text = await file.text();
      onChange(text);
    },
    [onChange]
  );

  const runOptimize = () => {
    if (!value.trim()) return;
    try {
      const result = optimizeSvg(value);
      onChange(result.optimized);
      setStats({ before: result.originalBytes, after: result.optimizedBytes, pct: result.savingsPct });
    } catch {
      setError("Couldn't optimize that SVG — it may be malformed. You can still register it as-is, or run it through https://jakearchibald.github.io/svgomg/ manually.");
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center text-sm font-medium text-ink/80">
        POAP artwork (SVG)
        <InfoTip title="Why SVG?">
          The contract stores your artwork's raw SVG markup directly onchain — no IPFS, no dead links,
          ever. Bitmap formats (PNG/JPG) aren't supported because they'd be far too expensive to store
          this way.
        </InfoTip>
      </label>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void loadFile(file);
        }}
        className="card flex flex-col items-center justify-center gap-2 border-dashed p-6 text-center text-sm text-ink/60"
      >
        <p>Drag an .svg file here, or paste an upload below.</p>
        <input
          type="file"
          accept=".svg,image/svg+xml"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void loadFile(file);
          }}
          className="text-xs text-ink/50"
        />
      </div>

      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setStats(null);
        }}
        placeholder="<svg>...</svg>"
        rows={6}
        className="w-full rounded-xl border border-ink/10 bg-ink/5 p-3 font-mono text-xs text-ink/80"
      />

      <div className="flex items-center gap-3">
        <button type="button" onClick={runOptimize} className="btn-secondary text-sm">
          Optimize with SVGO
        </button>
        {stats && (
          <span className="text-xs text-accent2">
            {stats.before}B → {stats.after}B ({stats.pct}% smaller — less gas to register)
          </span>
        )}
        <a
          href="https://jakearchibald.github.io/svgomg/"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-ink/40 underline"
        >
          or optimize manually with SVGOMG
        </a>
      </div>

      {value && (
        <div className="card flex h-40 items-center justify-center p-4">
          <div
            className="h-32 w-32"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(value, {
                USE_PROFILES: { svg: true, svgFilters: true },
                FORBID_TAGS: ["script"],
                FORBID_ATTR: ["onload", "onerror", "onclick"],
              }),
            }}
          />
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
