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
    const json = typeof window === "undefined"
      ? Buffer.from(uri.slice(prefix.length), "base64").toString("utf-8")
      : atob(uri.slice(prefix.length));
    return JSON.parse(json) as POAPMetadata;
  } catch {
    return null;
  }
}
