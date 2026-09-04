// The contract stores the raw SVG string, Base64-encodes it, and pays gas
// via SSTORE2 for every byte. An un-optimized SVG (embedded editor cruft,
// full <?xml?> prologs, unnecessary precision, inline comments) can easily
// cost 2-3x more gas to register than it needs to. We run SVGO in the
// browser via svgo/dist/svgo.browser.js so creators never have to leave the
// registration form or install anything locally.
import { optimize } from "svgo/dist/svgo.browser.js";

export interface SvgOptimizeResult {
  optimized: string;
  originalBytes: number;
  optimizedBytes: number;
  savingsPct: number;
}

export function optimizeSvg(raw: string): SvgOptimizeResult {
  const result = optimize(raw, {
    multipass: true,
    plugins: [
      {
        name: "preset-default",
        params: {
          overrides: {
            // Never strip viewBox — POAP artwork must stay responsive.
            removeViewBox: false,
          },
        },
      },
    ],
  });
  const optimized = "data" in result ? result.data : raw;
  const originalBytes = new Blob([raw]).size;
  const optimizedBytes = new Blob([optimized]).size;
  return {
    optimized,
    originalBytes,
    optimizedBytes,
    savingsPct: originalBytes > 0 ? Math.round((1 - optimizedBytes / originalBytes) * 100) : 0,
  };
}
