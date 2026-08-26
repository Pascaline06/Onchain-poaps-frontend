"use client";
import { useMemo, useState } from "react";
import { generateStampSvg, LAYOUT_LABELS, ICON_LABELS, type IconKey, type LayoutKey } from "@/lib/svgTemplates";
import { optimizeSvg } from "@/lib/svg";
import { POAPArtwork } from "./POAPArtwork";

const PALETTES: { name: string; accent: string; bg: string }[] = [
  { name: "Ink & Ember", accent: "#ff5a1f", bg: "#0b0d10" },
  { name: "Paper & Ink", accent: "#0b0d10", bg: "#faf7f0" },
  { name: "Deep Sea", accent: "#5ecbff", bg: "#0a1e2e" },
  { name: "Midnight Gold", accent: "#f4c542", bg: "#161221" },
  { name: "Field Note", accent: "#3d6b47", bg: "#f3ede0" },
];

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
  const [paletteIdx, setPaletteIdx] = useState(0);
  const [customAccent, setCustomAccent] = useState<string | null>(null);
  const [customBg, setCustomBg] = useState<string | null>(null);

  const accentColor = customAccent ?? PALETTES[paletteIdx].accent;
  const bgColor = customBg ?? PALETTES[paletteIdx].bg;

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
          <label className="text-sm font-medium text-ink/80">Palette</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PALETTES.map((p, i) => (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  setPaletteIdx(i);
                  setCustomAccent(null);
                  setCustomBg(null);
                }}
                title={p.name}
                className={`h-9 w-9 rounded-full border-2 transition ${
                  paletteIdx === i && !customAccent && !customBg ? "border-ink" : "border-transparent"
                }`}
                style={{ background: `linear-gradient(135deg, ${p.bg} 50%, ${p.accent} 50%)` }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-ink/60">
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
