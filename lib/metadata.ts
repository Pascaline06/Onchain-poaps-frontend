export interface POAPMetadata {
  name: string;
  description: string;
  image: string; // data:image/svg+xml;base64,...
  external_url: string;
  attributes: { trait_type: string; value: string; display_type?: string }[];
}

/**
 * The contract's uri() returns a full data:application/json;base64 URI —
 * there's no gateway to fetch, no IPFS to fall back on, so decoding this is
 * the entire "fetch metadata" step for this protocol.
 */
export function decodeTokenUri(uri: string): POAPMetadata | null {
  const prefix = "data:application/json;base64,";
  if (!uri.startsWith(prefix)) return null;
  try {
    const json = decodeBase64Utf8(uri.slice(prefix.length));
    return JSON.parse(json) as POAPMetadata;
  } catch {
    return null;
  }
}

// Browsers refuse to render some otherwise-valid SVGs when they're loaded
// via <img src="data:...">, for security reasons (no external stylesheets,
// no scripts, and some engines are stricter about filters/foreignObject in
// that context than when the same SVG is placed inline in the page). This
// extracts the raw <svg>...</svg> markup so a component can render it
// directly instead, which handles more of those cases.
export function decodeRawSvg(imageDataUri: string): string | null {
  const prefix = "data:image/svg+xml;base64,";
  if (!imageDataUri.startsWith(prefix)) return null;
  try {
    return decodeBase64Utf8(imageDataUri.slice(prefix.length));
  } catch {
    return null;
  }
}

// atob() only decodes base64 into a Latin1 (single-byte) string — the moment
// a creator's event name, description, or SVG text contains an emoji, an
// accented character, or any multi-byte UTF-8 sequence, atob mangles it and
// JSON.parse silently fails, which was showing up as "no artwork" for other
// creators' POAPs even though the data onchain was perfectly valid. Decoding
// through bytes + TextDecoder handles UTF-8 correctly, matching what
// Buffer.from(..., "base64").toString("utf-8") already does on the server.
function decodeBase64Utf8(b64: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}
