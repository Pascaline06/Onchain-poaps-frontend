import { baseSepolia, base } from "wagmi/chains";

// Verified contract, confirmed against onchain-poaps/README.md at commit time.
// Swap MAINNET_ADDRESS in once the mainnet deployment exists — nothing else changes.
export const CONTRACTS: Record<number, `0x${string}`> = {
  [baseSepolia.id]: "0xC3249356a483fbe17d5355D39105D2eA666d9de6",
  // [base.id]: "0x...", // fill in after mainnet deploy
};

export const DEFAULT_CHAIN = baseSepolia;

export function contractAddress(chainId: number): `0x${string}` {
  const addr = CONTRACTS[chainId];
  if (!addr) throw new Error(`No OnchainPOAPs deployment known for chain ${chainId}`);
  return addr;
}

// 30-day creator timelock, mirrors CREATOR_TIMELOCK on the contract (in seconds).
export const CREATOR_TIMELOCK_SECONDS = 30 * 24 * 60 * 60;
// mintWithSignature has an extra 7-day grace window beyond the timelock.
export const SIGNATURE_GRACE_SECONDS = 7 * 24 * 60 * 60;
