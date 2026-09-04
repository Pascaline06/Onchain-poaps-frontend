// Replaces a fixed palette of preset swatches with ink generated from the
// event's own name — the same way a real wax seal's exact shade always
// varied slightly by batch, by hand, by the wax itself, rather than being
// picked off a shelf of five identical options. Deterministic on the title
// so the same event name always finds its way back to the same ink, with a
// "shuffle" nonce for people who want a few more variations to choose from.

export interface GeneratedInk {
  accent: string;
  bg: string;
  name: string;
}

// A small, fast, deterministic string hash (FNV-1a) — not cryptographic,
// just needs to spread similar strings apart well enough that "ETHGlobal
// Lagos" and "ETHGlobal Nairobi" don't land on near-identical hues.
function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let [r, g, b] = [0, 0, 0];
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const toHex = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Named hue bands in the voice of ink and wax, not a generic color picker's
// "orange / red / blue" — this is what actually makes the generated result
// feel designed rather than random.
const INK_NAMES: { max: number; name: string }[] = [
  { max: 15, name: "Oxblood" },
  { max: 35, name: "Ember" },
  { max: 50, name: "Signal Amber" },
  { max: 70, name: "Aged Brass" },
  { max: 100, name: "Moss Ink" },
  { max: 140, name: "Verdigris" },
  { max: 175, name: "Deep Teal" },
  { max: 205, name: "Twilight Indigo" },
  { max: 235, name: "Deep Cobalt" },
  { max: 265, name: "Ink Violet" },
  { max: 300, name: "Plum Wax" },
  { max: 330, name: "Rose Seal" },
  { max: 361, name: "Oxblood" },
];

function nameForHue(hue: number): string {
  return INK_NAMES.find((band) => hue < band.max)?.name ?? "Ink";
}

function hexLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const [la, lb] = [hexLuminance(hexA), hexLuminance(hexB)];
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Derives an accent color, a background, and a human name from an event
 * title plus a nonce (0 for the "default" ink, 1+ for each shuffle). The
 * dark/light split is also derived from the hash rather than always dark —
 * real wax seals show up on both dark leather covers and cream paper, and
 * that variety is part of what makes this feel less like a template.
 *
 * Different hues have very different perceived brightness at the same HSL
 * lightness value (yellow reads far brighter than blue at an identical L),
 * so a fixed lightness formula produced genuinely unreadable combinations
 * for roughly a third of tested titles — contrast as low as 2.25 against a
 * 3.0 minimum. This walks the accent's lightness toward the background
 * until it clears a real measured contrast floor, so every generated ink
 * is actually legible, not just usually legible.
 */
export function deriveInk(seedText: string, nonce: number): GeneratedInk {
  const seed = seedText.trim() || "Your Event";
  const hash = hashString(`${seed}::${nonce}`);
  const hue = hash % 360;
  const isDarkBase = (hash >> 9) % 2 === 0;

  const bg = isDarkBase ? hslToHex(hue, 0.35, 0.09) : hslToHex(hue, 0.25, 0.95);

  const MIN_CONTRAST = 4.0; // comfortably clears WCAG's 3.0 floor for graphics/large text
  let accentLightness = isDarkBase ? 0.56 : 0.4;
  let accent = hslToHex(hue, 0.72, accentLightness);

  // On a dark background, contrast improves by lightening the accent
  // further (toward white); on a light background, by darkening it
  // (toward black). Step in that direction until the measured ratio
  // clears the floor, bailing out well before hitting pure white/black
  // so the color keeps its hue identity.
  let steps = 0;
  while (contrastRatio(accent, bg) < MIN_CONTRAST && steps < 40) {
    accentLightness = isDarkBase
      ? Math.min(0.92, accentLightness + 0.02)
      : Math.max(0.08, accentLightness - 0.02);
    accent = hslToHex(hue, 0.72, accentLightness);
    steps++;
  }

  return { accent, bg, name: nameForHue(hue) };
}
