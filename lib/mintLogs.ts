import type { usePublicClient } from "wagmi";
import { NEW_MINT_EVENT } from "./abi";

type WagmiPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

/**
 * Fetches every NewMint log for a given event.
 *
 * Base Sepolia's block numbers are already in the tens of millions, and
 * public RPCs commonly cap eth_getLogs to some maximum block range per
 * request that isn't published anywhere we can just read — so the history
 * has to be split into many smaller windows regardless. The first version
 * of this fetched those windows one at a time, sequentially, which was
 * correct but slow enough in practice to feel broken: several events times
 * however many chunks each needed, every single one waiting on the last.
 *
 * This version fires a bounded number of window requests concurrently
 * instead — a worker pool pulling from a shared queue — so wall-clock time
 * is roughly (total windows / concurrency) instead of (total windows).
 * Any individual window an RPC rejects for spanning too much history gets
 * split in half and re-queued rather than falling back to sequential
 * one-at-a-time discovery.
 */
export async function fetchMintLogsForEvent(
  publicClient: WagmiPublicClient,
  contractAddress: `0x${string}`,
  eventId: bigint,
  opts?: { lookbackBlocks?: bigint; chunkSize?: bigint; concurrency?: number }
): Promise<{ recipient: `0x${string}`; blockNumber: bigint }[]> {
  const latest = await publicClient.getBlockNumber();
  const lookback = opts?.lookbackBlocks ?? 2_000_000n; // ~46 days at a 2s block time — generous for a contract only a few weeks old
  const fromFloor = latest > lookback ? latest - lookback : 0n;
  const chunkSize = opts?.chunkSize ?? 10_000n; // a conservative default many public RPCs accept without rejection, avoiding wasted failed discovery calls
  const concurrency = opts?.concurrency ?? 12;

  const results: { recipient: `0x${string}`; blockNumber: bigint }[] = [];

  type Window = { from: bigint; to: bigint };
  const queue: Window[] = [];
  for (let from = fromFloor; from <= latest; from += chunkSize) {
    const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
    queue.push({ from, to });
  }

  async function processWindow(w: Window): Promise<void> {
    try {
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: NEW_MINT_EVENT,
        args: { eventId },
        fromBlock: w.from,
        toBlock: w.to,
      });
      for (const log of logs) {
        const recipient = log.args.recipient;
        if (recipient) results.push({ recipient, blockNumber: log.blockNumber ?? 0n });
      }
    } catch (err) {
      // Assume a rejection means the window was too large for this RPC and
      // split it in half rather than giving up — below ~250 blocks there's
      // nothing more useful to split, so surface the error.
      const span = w.to - w.from + 1n;
      if (span <= 250n) throw err;
      const mid = w.from + span / 2n;
      queue.push({ from: w.from, to: mid - 1n });
      queue.push({ from: mid, to: w.to });
    }
  }

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const w = queue.shift();
      if (!w) return;
      await processWindow(w);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }, () => worker()));

  return results;
}
