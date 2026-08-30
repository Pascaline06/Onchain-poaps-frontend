"use client";
import { useMemo, useState } from "react";
import { generateStampSvg, LAYOUT_LABELS, ICON_LABELS, type IconKey, type LayoutKey } from "@/lib/svgTemplates";
import { deriveInk } from "@/lib/generativeInk";
import { optimizeSvg } from "@/lib/svg";
import { POAPArtwork } from "./POAPArtwork";

/**
 * An in-browser stamp designer, offered as an alternative to pasting a raw
 * SVG. This exists because requiring people to already have artwork before
 * they can register a POAP is real friction — this generates a genuine,
 * onchain-storable SVG from a handful of choices, in the same visual
 * language (stamps, seals, ticket stubs) the rest of this app already uses.
 */
export function StampDesigner({ onUse }: { onUse: (svg: string) => void }) {
  const [title, setTitle] = useState("Your Event");
  const [subtitle, setSubtitle] = useState("Base · 2026");
  const [layout, setLayout] = useState<LayoutKey>("circularStamp");
  const [icon, setIcon] = useState<IconKey>("star");
  const [inkNonce, setInkNonce] = useState(0);
  const [customAccent, setCustomAccent] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);

  // The ink is derived from the event's own title rather than picked off a
  // shelf of preset swatches — the same title always finds its way back to
  // the same ink, and "Shuffle" asks for a few more variations without
  // touching the title itself.
  const generatedInk = useMemo(() => deriveInk(title, inkNonce), [title, inkNonce]);
  const accentColor = customAccent ?? generatedInk.accent;
  const bgColor = customBg ?? generatedInk.bg;
  const isCustomized = customAccent !== null || customBg !== null;

  const svg = useMemo(
    () => generateStampSvg({ title, subtitle, accentColor, bgColor, icon, layout }),
    [title, subtitle, accentColor, bgColor, icon, layout]
  );

  const dataUri = useMemo(() => {
    const b64 = typeof window !== "undefined" ? btoa(unescape(encodeURIComponent(svg))) : "";
    return `data:image/svg+xml;base64,${b64}`;
  }, [svg]);

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_260px]">
      <div className="space-y-5">
        <div>
          <label className="text-sm font-medium text-ink/80">Layout</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {(Object.keys(LAYOUT_LABELS) as LayoutKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setLayout(key)}
                className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  layout === key ? "border-accent bg-accent/10 text-accent" : "border-ink/15 text-ink/60 hover:border-ink/30"
                }`}
              >
                {LAYOUT_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink/80">Title text</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={40}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-white/60 p-2.5 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-ink/80">Subtitle / date</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={32}
              className="mt-1 w-full rounded-xl border border-ink/15 bg-white/60 p-2.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-ink/80">Icon</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(Object.keys(ICON_LABELS) as IconKey[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setIcon(key)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  icon === key ? "border-accent bg-accent/10 text-accent" : "border-ink/15 text-ink/60 hover:border-ink/30"
                }`}
              >
                {ICON_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-medium text-ink/80">Signature ink</label>
            {isCustomized && (
              <button
                type="button"
                onClick={() => {
                  setCustomAccent(null);
                  setCustomBg(null);
                }}
                className="text-xs text-ink/40 underline hover:text-accent"
              >
                Back to generated
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-ink/50">
            Every event name finds its own ink — {isCustomized ? "you're overriding it below." : "this one's yours."}
          </p>

          <div className="mt-3 flex items-center gap-4">
            <div
              className="h-16 w-16 shrink-0 rounded-full border-2 border-ink/10 shadow-sm"
              style={{ background: `conic-gradient(${accentColor} 0deg 180deg, ${bgColor} 180deg 360deg)` }}
            />
            <div className="flex-1">
              <p className="font-display text-lg font-semibold text-ink">
                {isCustomized ? "Custom ink" : generatedInk.name}
              </p>
              <button
                type="button"
                onClick={() => setInkNonce((n) => n + 1)}
                className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-ink/15 px-3 py-1 text-xs font-medium text-ink/70 transition hover:border-accent hover:text-accent"
              >
                <span aria-hidden>✨</span> Shuffle for another take
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-ink/60">
            <label className="flex items-center gap-2">
              Accent
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setCustomAccent(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-ink/15"
              />
            </label>
            <label className="flex items-center gap-2">
              Background
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setCustomBg(e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-ink/15"
              />
            </label>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            // Optimized before handing off, same as the manual SVG path —
            // there's no reason a generated stamp should cost more gas to
            // register than a hand-optimized one.
            try {
              const { optimized } = optimizeSvg(svg);
              onUse(optimized);
            } catch {
              onUse(svg);
            }
          }}
          className="btn-primary w-full"
        >
          Use this design
        </button>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">Live preview</p>
        <div className="card flex h-56 w-56 items-center justify-center p-4">
          <POAPArtwork
            imageDataUri={dataUri}
            alt="Stamp preview"
            className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full"
            fallback={<span className="text-xs text-ink/30">Rendering…</span>}
          />
        </div>
      </div>
    </div>
  );
}
