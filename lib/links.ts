import { contractAddress } from "./contract";

/**
 * Base Sepolia only for now, matching contract.ts — swap to mainnet
 * OpenSea/BaseScan hosts alongside CONTRACTS[base.id] once that exists.
 */
export function openSeaUrl(chainId: number, eventId: bigint): string {
  return `https://testnets.opensea.io/assets/base-sepolia/${contractAddress(chainId)}/${eventId.toString()}`;
}

export function baseScanTxUrl(hash: `0x${string}`): string {
  return `https://sepolia.basescan.org/tx/${hash}`;
}

export function baseScanAddressUrl(address: `0x${string}`): string {
  return `https://sepolia.basescan.org/address/${address}`;
}

export function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
