/**
 * Turns a seed string (owner address + event id) into a deterministic list
 * of bar heights, each between 0 and 1. Not a real barcode encoding — this
 * is decorative, meant to make the boarding pass stub look like it's
 * carrying real per-mint data rather than a static piece of clip art, while
 * staying identical between the live component and the canvas export
 * without either one depending on the other's rendering code.
 */
export function barcodeBars(seed: string, count: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    // xorshift-ish step, cheap and good enough for a visual pattern.
    h ^= h << 13;
    h >>>= 0;
    h ^= h >> 17;
    h ^= h << 5;
    h >>>= 0;
    bars.push(0.25 + (h % 1000) / 1000 / 1.4); // keep bars readably tall, 0.25–~0.96
  }
  return bars;
}
