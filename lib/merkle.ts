import { keccak256, encodePacked, isAddress, getAddress } from "viem";
import { MerkleTree } from "merkletreejs";

// CRITICAL: this leaf encoding must match the contract exactly.
// Poap.sol computes: bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
// i.e. a single packed `address`, NOT abi.encode, NOT keccak256(address+amount).
// Getting this wrong is the single most common way an allowlist silently
// stops working — every proof verifies against the wrong tree.
function leafOf(address: `0x${string}`): Buffer {
  const packed = encodePacked(["address"], [getAddress(address)]);
  return Buffer.from(keccak256(packed).slice(2), "hex");
}

export interface AllowlistBuildResult {
  root: `0x${string}`;
  addresses: string[];
  proofs: Record<string, `0x${string}`[]>;
}

/**
 * Build a Merkle tree from a raw list of addresses (one per line, or comma/
 * whitespace separated — see parseAddressList) and return the root plus a
 * proof for every address. sortPairs matches OpenZeppelin's MerkleProof,
 * which the contract uses to verify.
 */
export function buildAllowlist(rawAddresses: string[]): AllowlistBuildResult {
  const addresses = dedupeAndValidate(rawAddresses);
  if (addresses.length === 0) {
    throw new Error("No valid addresses found in the list.");
  }

  const leaves = addresses.map((a) => leafOf(a as `0x${string}`));
  const tree = new MerkleTree(leaves, keccak256Buf, { sortPairs: true });
  const root = ("0x" + tree.getRoot().toString("hex")) as `0x${string}`;

  const proofs: Record<string, `0x${string}`[]> = {};
  addresses.forEach((addr, i) => {
    const proof = tree.getProof(leaves[i]).map((p) => ("0x" + p.data.toString("hex")) as `0x${string}`);
    proofs[getAddress(addr)] = proof;
  });

  return { root, addresses: addresses.map(getAddress), proofs };
}

/** Get a single address's proof out of an already-built allowlist file. */
export function proofFor(build: AllowlistBuildResult, address: string): `0x${string}`[] | null {
  if (!isAddress(address)) return null;
  return build.proofs[getAddress(address)] ?? null;
}

export function parseAddressList(raw: string): string[] {
  return raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dedupeAndValidate(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const a of list) {
    if (!isAddress(a)) continue;
    const checksummed = getAddress(a);
    if (seen.has(checksummed)) continue;
    seen.add(checksummed);
    out.push(checksummed);
  }
  return out;
}

// merkletreejs wants a hashing fn with a plain-Buffer signature.
function keccak256Buf(data: Buffer): Buffer {
  return Buffer.from(keccak256(`0x${data.toString("hex")}`).slice(2), "hex");
}
