import type { usePublicClient } from "wagmi";
import { NEW_MINT_EVENT } from "./abi";

type WagmiPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

/**
 * Fetches every NewMint log for a given event, across however much block
 * history a public RPC will allow per call — without knowing in advance
 * what that limit is.
 *
 * Public RPCs commonly cap eth_getLogs to some maximum block range per
 * request (the exact number varies by provider and isn't published
 * anywhere we can just read), and Base Sepolia's block numbers are already
 * in the tens of millions, so querying from genesis in one call is not an
 * option. This starts with a generous chunk size and, if a request is
 * rejected for covering too large a range, halves the chunk and retries —
 * rather than hardcoding a number that might be wrong for whichever RPC
 * the person deploying this has configured.
 */
export async function fetchMintLogsForEvent(
  publicClient: WagmiPublicClient,
  contractAddress: `0x${string}`,
  eventId: bigint,
  opts?: { lookbackBlocks?: bigint; initialChunk?: bigint }
): Promise<{ recipient: `0x${string}`; blockNumber: bigint }[]> {
  const latest = await publicClient.getBlockNumber();
  const lookback = opts?.lookbackBlocks ?? 3_000_000n; // generously covers a contract only a few weeks old on a ~2s block time chain
  const fromFloor = latest > lookback ? latest - lookback : 0n;

  const results: { recipient: `0x${string}`; blockNumber: bigint }[] = [];
  let chunk = opts?.initialChunk ?? 100_000n;
  let cursor = fromFloor;

  while (cursor <= latest) {
    const to = cursor + chunk > latest ? latest : cursor + chunk;
    try {
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: NEW_MINT_EVENT,
        args: { eventId },
        fromBlock: cursor,
        toBlock: to,
      });
      for (const log of logs) {
        const recipient = log.args.recipient;
        if (recipient) results.push({ recipient, blockNumber: log.blockNumber ?? 0n });
      }
      cursor = to + 1n;
    } catch (err) {
      // Assume any failure here is a range-too-large rejection and retry
      // with a smaller window, rather than distinguishing error types the
      // RPC provider doesn't consistently label anyway. Below ~500 blocks
      // there's nothing more useful to do — surface what we have.
      if (chunk <= 500n) throw err;
      chunk = chunk / 4n;
    }
  }

  return results;
}
