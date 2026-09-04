import type { PassportEntryData } from "./usePassportEntryData";
import { formatEventDate } from "@/components/PassportEntry";
import { shortAddress } from "./links";
import { barcodeBars } from "./boardingPassBarcode";

// Same literal paper/ink pair as exportPassportSpread.ts, and for the same
// reason: this is a printed artifact (a ticket stub), not a screenshot of
// the app chrome, so it stays on light "card stock" regardless of whether
// the site itself is in light or dark mode.
const PAPER = "#faf7f0";
const INK = "#0b0d10";
const ACCENT = "#ff5a1f";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Renders the boarding pass to a canvas and triggers a PNG download —
 * entirely client-side, matching exportPassportSpread's no-backend
 * approach. Kept as a standalone function (rather than snapshotting the
 * on-page component with a DOM-to-image library) so the export doesn't
 * pull in a new dependency just for this one feature.
 */
export async function exportBoardingPass(params: {
  data: PassportEntryData;
  eventId: bigint;
  owner: `0x${string}`;
  filename: string;
}): Promise<void> {
  const { data, eventId, owner, filename } = params;
  const width = 1000;
  const height = 380;
  const stubWidth = 230;
  const mainWidth = width - stubWidth;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  // Base card + dot texture, same treatment as the passport export.
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "rgba(11,13,16,0.06)";
  for (let x = 0; x < width; x += 22) {
    for (let y = 0; y < height; y += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Stub background, slightly darker to read as a separate ticket section.
  ctx.fillStyle = "rgba(11,13,16,0.04)";
  ctx.fillRect(mainWidth, 0, stubWidth, height);

  // Perforation: a dashed line with two punched-out circles, using the
  // page's own background color so the circles read as cut through the
  // card rather than drawn on top of it.
  ctx.strokeStyle = "rgba(11,13,16,0.25)";
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(mainWidth, 0);
  ctx.lineTo(mainWidth, height);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  ctx.arc(mainWidth, 0, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(mainWidth, height, 14, 0, Math.PI * 2);
  ctx.fill();

  // --- Main stub ---
  const pad = 44;
  ctx.fillStyle = ACCENT;
  ctx.font = "700 11px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("BOARDING PASS · ONCHAIN POAPS", pad, 46);

  const artSize = 110;
  const image = data.image ? await loadImage(data.image) : null;
  if (image) {
    ctx.drawImage(image, pad, 66, artSize, artSize);
  } else {
    ctx.strokeStyle = "rgba(11,13,16,0.15)";
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(pad, 66, artSize, artSize);
    ctx.setLineDash([]);
  }

  const textX = pad + artSize + 28;
  ctx.fillStyle = INK;
  ctx.font = "600 28px Georgia, serif";
  ctx.fillText(data.name || "Untitled POAP", textX, 108);

  ctx.fillStyle = "rgba(11,13,16,0.55)";
  ctx.font = "14px system-ui, sans-serif";
  const subtitle = [data.location, formatEventDate(data.eventDate)].filter(Boolean).join(" · ");
  ctx.fillText(subtitle || "No date or location given", textX, 136);

  // Passenger / gate / event row, ticket-style all-caps labels.
  const rowY = 220;
  const cols = [
    { label: "PASSENGER", value: shortAddress(owner) },
    { label: "GATE", value: "BASE SEPOLIA" },
    { label: "EVENT NO.", value: `#${eventId.toString()}` },
  ];
  cols.forEach((col, i) => {
    const x = pad + i * 220;
    ctx.fillStyle = "rgba(11,13,16,0.4)";
    ctx.font = "600 11px 'Space Mono', monospace";
    ctx.fillText(col.label, x, rowY);
    ctx.fillStyle = INK;
    ctx.font = "600 16px 'Space Mono', monospace";
    ctx.fillText(col.value, x, rowY + 24);
  });

  ctx.fillStyle = "rgba(11,13,16,0.35)";
  ctx.font = "12px system-ui, sans-serif";
  ctx.fillText("Proof you were there — verifiable onchain, no account required.", pad, height - 30);

  // --- Right stub ---
  ctx.save();
  ctx.translate(mainWidth + 46, height / 2 + 40);
  ctx.rotate(-Math.PI / 2);
  ctx.fillStyle = "rgba(11,13,16,0.45)";
  ctx.font = "700 12px 'Space Mono', monospace";
  ctx.textAlign = "left";
  ctx.fillText("ONCHAIN POAPS", 0, 0);
  ctx.restore();

  // A deterministic "barcode" pattern derived from the owner + event id, so
  // it looks like real ticket data rather than decoration for its own sake.
  const bars = barcodeBars(`${owner}-${eventId.toString()}`, 26);
  let barX = mainWidth + 40;
  const barY = 40;
  const barMaxHeight = 90;
  bars.forEach((h) => {
    ctx.fillStyle = INK;
    ctx.fillRect(barX, barY, 4, barMaxHeight * h);
    barX += 7;
  });

  ctx.fillStyle = "rgba(11,13,16,0.4)";
  ctx.font = "600 11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`#${eventId.toString()}`, mainWidth + stubWidth / 2, 300);
  ctx.fillText("VERIFIED ONCHAIN", mainWidth + stubWidth / 2, height - 30);

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
