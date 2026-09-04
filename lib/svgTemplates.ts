// Generates real, valid SVG markup for the in-app Stamp Designer — no
// external rendering service, no canvas-to-image conversion, just strings
// built from the same values the live preview uses. Every template ties
// back to the actual "passport stamp" concept the rest of this app uses,
// rather than being a generic badge-maker.

export interface StampParams {
  title: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  icon: IconKey;
  layout: LayoutKey;
}

export type IconKey = "star" | "bolt" | "check" | "pin" | "ticket" | "none";
export type LayoutKey = "circularStamp" | "ticketStub" | "waxSeal";

const ICONS: Record<IconKey, (color: string, bgColor: string) => string> = {
  star: (c) => `<path d="M50 20l7.5 18.5L77 40l-15 13 4.5 20L50 63l-16.5 10L38 53 23 40l19.5-1.5z" fill="${c}"/>`,
  bolt: (c) => `<path d="M55 15 L30 55 H46 L42 85 L70 45 H53 Z" fill="${c}"/>`,
  check: (c) => `<path d="M28 52 L42 66 L74 32" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  pin: (c) => `<path d="M50 20a18 18 0 0 1 18 18c0 13-18 38-18 38s-18-25-18-38a18 18 0 0 1 18-18z" fill="${c}"/><circle cx="50" cy="38" r="7" fill="white"/>`,
  ticket: (c, bg) => `<rect x="22" y="35" width="56" height="30" rx="4" fill="${c}"/><circle cx="22" cy="50" r="5" fill="${bg}"/><circle cx="78" cy="50" r="5" fill="${bg}"/>`,
  none: () => "",
};

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// A rotated ink-stamp ring, matching the .stamp CSS treatment used
// throughout the rest of this app — the same visual language, just
// generated as artwork instead of UI chrome.
function circularStamp({ title, subtitle, accentColor, bgColor, icon }: StampParams): string {
  const t = escapeXml(title.toUpperCase().slice(0, 24));
  const s = escapeXml(subtitle.toUpperCase().slice(0, 24));
  const pathId = `textPath-${Math.random().toString(36).slice(2, 8)}`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bgColor}"/>
  <circle cx="200" cy="200" r="150" fill="none" stroke="${accentColor}" stroke-width="6"/>
  <circle cx="200" cy="200" r="132" fill="none" stroke="${accentColor}" stroke-width="1.5" stroke-dasharray="4 5"/>
  <path id="${pathId}" d="M 80 200 A 120 120 0 1 1 320 200" fill="none"/>
  <text font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${accentColor}" letter-spacing="2">
    <textPath href="#${pathId}" startOffset="50%" text-anchor="middle">${t}</textPath>
  </text>
  <g transform="translate(150,150) scale(1)" fill="${accentColor}">${ICONS[icon](accentColor, bgColor)}</g>
  <text x="200" y="330" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="${accentColor}" text-anchor="middle" letter-spacing="1.5">${s}</text>
</svg>`;
}

// A physical event-ticket look — perforated edge, torn-stub circles, a
// stamped corner number placeholder left as static "№" for now.
function ticketStub({ title, subtitle, accentColor, bgColor, icon }: StampParams): string {
  const t = escapeXml(title.slice(0, 28));
  const s = escapeXml(subtitle.slice(0, 32));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bgColor}"/>
  <rect x="24" y="24" width="352" height="352" fill="none" stroke="${accentColor}" stroke-width="3" stroke-dasharray="6 6"/>
  <line x1="24" y1="270" x2="376" y2="270" stroke="${accentColor}" stroke-width="2" stroke-dasharray="2 6"/>
  <g transform="translate(160,90) scale(1.4)" fill="${accentColor}">${ICONS[icon](accentColor, bgColor)}</g>
  <text x="200" y="220" font-family="Georgia, serif" font-size="30" font-weight="bold" fill="${accentColor}" text-anchor="middle">${t}</text>
  <text x="200" y="325" font-family="'Courier New', monospace" font-size="16" fill="${accentColor}" text-anchor="middle" letter-spacing="3">${s}</text>
</svg>`;
}

// A wax-seal medallion — solid filled circle with an embossed-feeling inner
// ring, closer to a literal seal than a printed stamp.
function waxSeal({ title, subtitle, accentColor, bgColor, icon }: StampParams): string {
  const t = escapeXml(title.toUpperCase().slice(0, 20));
  const s = escapeXml(subtitle.toUpperCase().slice(0, 20));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${bgColor}"/>
  <circle cx="200" cy="200" r="160" fill="${accentColor}"/>
  <circle cx="200" cy="200" r="142" fill="none" stroke="${bgColor}" stroke-width="3"/>
  <g transform="translate(150,130) scale(1)" fill="${bgColor}">${ICONS[icon](bgColor, accentColor)}</g>
  <text x="200" y="290" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="${bgColor}" text-anchor="middle" letter-spacing="1">${t}</text>
  <text x="200" y="315" font-family="Georgia, serif" font-size="13" fill="${bgColor}" text-anchor="middle" letter-spacing="3" opacity="0.85">${s}</text>
</svg>`;
}

const LAYOUTS: Record<LayoutKey, (p: StampParams) => string> = {
  circularStamp,
  ticketStub,
  waxSeal,
};

export const LAYOUT_LABELS: Record<LayoutKey, string> = {
  circularStamp: "Circular stamp",
  ticketStub: "Ticket stub",
  waxSeal: "Wax seal",
};

export const ICON_LABELS: Record<IconKey, string> = {
  star: "Star",
  bolt: "Bolt",
  check: "Check",
  pin: "Location pin",
  ticket: "Ticket",
  none: "No icon",
};

export function generateStampSvg(params: StampParams): string {
  return LAYOUTS[params.layout](params);
}
