import type { PassportEntryData } from "./usePassportEntryData";
import { formatEventDate } from "@/components/PassportEntry";

const PAPER = "#faf7f0";
const INK = "#0b0d10";
const ACCENT = "#ff5a1f";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    // Some valid SVGs are known to silently fail when loaded this way —
    // the same restriction browsers apply to <img src="data:...">. Rather
    // than let that produce a blank spot in the exported image with no
    // explanation, resolve to null on failure so the caller can draw an
    // honest placeholder instead.
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawEntry(
  ctx: CanvasRenderingContext2D,
  entry: { data: PassportEntryData; entryNumber: number; image: HTMLImageElement | null },
  offsetX: number,
  width: number,
  height: number
) {
  const centerX = offsetX + width / 2;

  ctx.fillStyle = INK;
  ctx.globalAlpha = 0.4;
  ctx.font = "600 13px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText(`ENTRY NO. ${String(entry.entryNumber).padStart(3, "0")}`, centerX, offsetX ? 60 : 60);
  ctx.globalAlpha = 1;

  const artSize = Math.min(width * 0.55, height * 0.4);
  const artX = centerX - artSize / 2;
  const artY = 90;

  if (entry.image) {
    ctx.drawImage(entry.image, artX, artY, artSize, artSize);
  } else {
    ctx.strokeStyle = "rgba(11,13,16,0.15)";
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeRect(artX, artY, artSize, artSize);
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(11,13,16,0.3)";
    ctx.font = "12px 'Space Mono', monospace";
    ctx.fillText("artwork unavailable", centerX, artY + artSize / 2);
  }

  ctx.fillStyle = INK;
  ctx.font = "600 20px Georgia, serif";
  ctx.fillText(entry.data.name || "Untitled POAP", centerX, artY + artSize + 40);

  ctx.fillStyle = "rgba(11,13,16,0.55)";
  ctx.font = "13px system-ui, sans-serif";
  const subtitle = [entry.data.location, formatEventDate(entry.data.eventDate)].filter(Boolean).join(" · ");
  ctx.fillText(subtitle || "No date or location given", centerX, artY + artSize + 65);
}

/**
 * Renders the current two-entry spread to a canvas and triggers a PNG
 * download — entirely client-side, no server round-trip, matching the
 * rest of this app's "nothing here depends on a backend" posture.
 */
export async function exportPassportSpread(
  entries: { data: PassportEntryData; entryNumber: number }[],
  filename: string
): Promise<void> {
  const width = 900;
  const height = 620;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser.");

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, width, height);

  // Subtle dot grid, matching the site's own background texture.
  ctx.fillStyle = "rgba(11,13,16,0.06)";
  for (let x = 0; x < width; x += 22) {
    for (let y = 0; y < height; y += 22) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Center fold shadow, the one detail that says "book" instead of "card."
  const gradient = ctx.createLinearGradient(width / 2 - 20, 0, width / 2 + 20, 0);
  gradient.addColorStop(0, "rgba(11,13,16,0)");
  gradient.addColorStop(0.5, "rgba(11,13,16,0.08)");
  gradient.addColorStop(1, "rgba(11,13,16,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(width / 2 - 20, 0, 40, height);

  const loadedImages = await Promise.all(entries.map((e) => (e.data.image ? loadImage(e.data.image) : Promise.resolve(null))));

  entries.forEach((entry, i) => {
    const halfWidth = width / 2;
    drawEntry(ctx, { ...entry, image: loadedImages[i] }, i * halfWidth, halfWidth, height);
  });

  ctx.fillStyle = ACCENT;
  ctx.font = "600 11px 'Space Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("ONCHAIN POAPS · BASE SEPOLIA", width / 2, height - 24);

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.click();
}
