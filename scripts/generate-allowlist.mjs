#!/usr/bin/env node
// Generates a Merkle root + per-address proofs from a plain text/CSV list of
// addresses, without opening the app — useful for creators scripting
// distribution, or generating an allowlist ahead of time to paste the root
// into a registration transaction directly.
//
// Usage: node scripts/generate-allowlist.mjs addresses.txt > allowlist.json
import { readFileSync } from "node:fs";
import { keccak256, encodePacked, isAddress, getAddress } from "viem";
import { MerkleTree } from "merkletreejs";

const file = process.argv[2];
if (!file) {
  console.error("Usage: node scripts/generate-allowlist.mjs <addresses.txt>");
  process.exit(1);
}

const raw = readFileSync(file, "utf-8");
const seen = new Set();
const addresses = raw
  .split(/[\s,;]+/)
  .map((s) => s.trim())
  .filter(Boolean)
  .filter((a) => isAddress(a))
  .map((a) => getAddress(a))
  .filter((a) => (seen.has(a) ? false : (seen.add(a), true)));

if (addresses.length === 0) {
  console.error("No valid addresses found.");
  process.exit(1);
}

function keccak256Buf(data) {
  return Buffer.from(keccak256(`0x${data.toString("hex")}`).slice(2), "hex");
}
function leafOf(address) {
  return Buffer.from(keccak256(encodePacked(["address"], [address])).slice(2), "hex");
}

const leaves = addresses.map(leafOf);
const tree = new MerkleTree(leaves, keccak256Buf, { sortPairs: true });
const root = "0x" + tree.getRoot().toString("hex");

const proofs = {};
addresses.forEach((addr, i) => {
  proofs[addr] = tree.getProof(leaves[i]).map((p) => "0x" + p.data.toString("hex"));
});

console.log(JSON.stringify({ root, count: addresses.length, proofs }, null, 2));
