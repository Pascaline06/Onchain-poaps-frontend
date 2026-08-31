import type { usePublicClient } from "wagmi";
import { NEW_MINT_EVENT } from "./abi";

type WagmiPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Fetches every NewMint log for a set of events, sharing ONE global
 * concurrency limit and ONE global request queue across all of them.
 *
 * The first version of this gave each event its own independent worker
 * pool — correct in isolation, but calling it once per event meant the
 * pools stacked: a wallet holding 4 events could produce up to 4× the
 * intended concurrency all hitting the RPC at once, which is exactly what
 * tripped "over rate limit" errors in practice, on both this feature and
 * unrelated reads elsewhere in the app sharing the same endpoint.
 *
 * There are two genuinely different failure modes here, and they need
 * opposite responses: a block-range rejection means "this window is too
 * big, split it into two smaller ones," while a rate-limit rejection means
 * "this exact window was fine, just wait and ask again" — splitting on a
 * rate-limit error would only send more requests and make the throttling
 * worse, not better.
 */
export async function fetchMintLogsForEvents(
  publicClient: WagmiPublicClient,
  contractAddress: `0x${string}`,
  eventIds: bigint[],
  opts?: { lookbackBlocks?: bigint; chunkSize?: bigint; concurrency?: number }
): Promise<Map<string, { recipient: `0x${string}`; blockNumber: bigint }[]>> {
  const results = new Map<string, { recipient: `0x${string}`; blockNumber: bigint }[]>();
  eventIds.forEach((id) => results.set(id.toString(), []));
  if (eventIds.length === 0) return results;

  const latest = await publicClient.getBlockNumber();
  const lookback = opts?.lookbackBlocks ?? 2_000_000n; // ~46 days at a 2s block time — generous for a contract only a few weeks old
  const fromFloor = latest > lookback ? latest - lookback : 0n;
  // Large chunks on purpose: the failure mode actually observed in
  // production was a request-rate limit, not a block-range limit, so
  // fewer/bigger requests are strictly better here. Range-too-large is
  // still handled below as a fallback for RPCs that do cap it.
  const chunkSize = opts?.chunkSize ?? 200_000n;
  const concurrency = opts?.concurrency ?? 2; // conservative on purpose — this is a shared free public endpoint, not a dedicated one

  type Task = { eventId: bigint; from: bigint; to: bigint; attempt: number };
  const queue: Task[] = [];
  for (const eventId of eventIds) {
    for (let from = fromFloor; from <= latest; from += chunkSize) {
      const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
      queue.push({ eventId, from, to, attempt: 0 });
    }
  }

  const MAX_RATE_LIMIT_RETRIES = 5;

  async function processTask(t: Task): Promise<void> {
    try {
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: NEW_MINT_EVENT,
        args: { eventId: t.eventId },
        fromBlock: t.from,
        toBlock: t.to,
      });
      const bucket = results.get(t.eventId.toString())!;
      for (const log of logs) {
        const recipient = log.args.recipient;
        if (recipient) bucket.push({ recipient, blockNumber: log.blockNumber ?? 0n });
      }
    } catch (err) {
      if (isRateLimitError(err)) {
        if (t.attempt >= MAX_RATE_LIMIT_RETRIES) throw err;
        // Exponential backoff on the exact same window — re-requesting it
        // is fine, the window itself wasn't the problem, the request rate
        // was. 600ms, 1.2s, 2.4s, 4.8s, 9.6s.
        await sleep(600 * 2 ** t.attempt);
        queue.push({ ...t, attempt: t.attempt + 1 });
        return;
      }
      // Not a rate-limit error — assume the block range itself was
      // rejected as too large and split it, same as before.
      const span = t.to - t.from + 1n;
      if (span <= 250n) throw err;
      const mid = t.from + span / 2n;
      queue.push({ eventId: t.eventId, from: t.from, to: mid - 1n, attempt: 0 });
      queue.push({ eventId: t.eventId, from: mid, to: t.to, attempt: 0 });
    }
  }

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const t = queue.shift();
      if (!t) return;
      await processTask(t);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }, () => worker()));

  return results;
}
