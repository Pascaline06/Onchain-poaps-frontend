"use client";
import { useAccount, useReadContract } from "wagmi";
import { POAP_ABI } from "./abi";
import { contractAddress, DEFAULT_CHAIN } from "./contract";
import { decodeTokenUri } from "./metadata";

export interface PassportEntryData {
  name: string;
  location: string;
  eventDate: bigint;
  image: string | undefined;
  loaded: boolean;
}

/**
 * Resolves one event's display data once, so both the on-page passport
 * entry and the canvas-based export (which needs the same image data URI
 * directly, not locked inside a component) read from a single source
 * rather than fetching the same thing twice.
 *
 * eventId is optional because a passport spread's second slot is empty
 * when someone holds an odd number of POAPs — the read is gated off
 * entirely rather than attempting a call with a placeholder ID, which
 * would try to encode an invalid value into the contract's uint256
 * argument.
 */
export function usePassportEntryData(eventId: bigint | undefined): PassportEntryData {
  const { chainId: connectedChainId } = useAccount();
  const chainId = connectedChainId ?? DEFAULT_CHAIN.id;

  const { data: evt } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "events",
    args: eventId !== undefined ? [eventId] : undefined,
    query: { enabled: eventId !== undefined },
  });

  const { data: uri } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "uri",
    args: eventId !== undefined ? [eventId] : undefined,
    query: { enabled: eventId !== undefined },
  });

  const meta = uri ? decodeTokenUri(uri) : null;
  const [name, , eventDate, location] = evt ?? ["", "", 0n, ""];

  return { name, location, eventDate, image: meta?.image, loaded: Boolean(evt) };
}
