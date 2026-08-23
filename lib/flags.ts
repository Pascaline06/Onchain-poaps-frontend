// The contract packs soulbound/public into a single uint8 "flags" argument:
//   0 = transferable, not public
//   1 = soulbound, not public
//   2 = transferable, public
//   3 = soulbound, public
// Nobody registering a POAP should ever have to think in bit flags — the UI
// exposes two plain switches ("Soulbound?" / "Enable public minting now?")
// and this file is the only place that knows the encoding.
export function toFlags(isSoulbound: boolean, isPublic: boolean): number {
  return (isSoulbound ? 1 : 0) | (isPublic ? 2 : 0);
}

export function fromFlags(flags: number): { isSoulbound: boolean; isPublic: boolean } {
  return { isSoulbound: (flags & 1) === 1, isPublic: (flags & 2) === 2 };
}
