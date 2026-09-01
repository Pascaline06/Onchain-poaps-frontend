import type { usePublicClient } from "wagmi";
import { NEW_MINT_EVENT } from "./abi";

type WagmiPublicClient = NonNullable<ReturnType<typeof usePublicClient>>;
type MintLog = { recipient: `0x${string}`; blockNumber: bigint };

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
  return msg.includes("rate limit") || msg.includes("429") || msg.includes("too many requests");
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface FetchLogsResult {
  results: Map<string, MintLog[]>;
  incomplete: boolean; // true if the time or task budget ran out before every window was read
}

/**
 * Fetches every NewMint log for a set of events, sharing ONE global
 * concurrency limit and ONE global request queue across all of them.
 *
 * Two hard bounds exist specifically because an earlier version of this
 * had neither, and it produced a real six-minute hang in practice: a
 * single window that keeps getting rejected can cascade into splitting
 * again and again, and each of those splits can independently need retries
 * with growing backoff — with nothing capping total requests or total
 * time, that cascade has no ceiling. Now there is one: past either bound,
 * fetching stops and returns whatever was found so far, marked incomplete,
 * rather than continuing indefinitely. A page that says "here's what I
 * found in 12 seconds, might be missing a little" is a working feature; a
 * spinner with no ceiling is not, no matter how correct the logic under it
 * eventually turns out to be.
 *
 * onProgress, if given, is called after every completed window so the
 * caller can show results as they arrive instead of an all-or-nothing
 * wait for full completion.
 */
export async function fetchMintLogsForEvents(
  publicClient: WagmiPublicClient,
  contractAddress: `0x${string}`,
  eventIds: bigint[],
  opts?: {
    lookbackBlocks?: bigint;
    chunkSize?: bigint;
    concurrency?: number;
    timeBudgetMs?: number;
    maxTasks?: number;
    onProgress?: (partial: Map<string, MintLog[]>) => void;
  }
): Promise<FetchLogsResult> {
  const results = new Map<string, MintLog[]>();
  eventIds.forEach((id) => results.set(id.toString(), []));
  if (eventIds.length === 0) return { results, incomplete: false };

  const latest = await publicClient.getBlockNumber();
  const lookback = opts?.lookbackBlocks ?? 1_000_000n; // ~23 days at a 2s block time — a contract only a few weeks old, tightened from 2M for speed
  const fromFloor = latest > lookback ? latest - lookback : 0n;
  const chunkSize = opts?.chunkSize ?? 200_000n;
  const concurrency = opts?.concurrency ?? 3;
  const timeBudgetMs = opts?.timeBudgetMs ?? 12_000;
  const maxTasks = opts?.maxTasks ?? 120;

  type Task = { eventId: bigint; from: bigint; to: bigint; attempt: number };
  const queue: Task[] = [];
  for (const eventId of eventIds) {
    for (let from = fromFloor; from <= latest; from += chunkSize) {
      const to = from + chunkSize - 1n > latest ? latest : from + chunkSize - 1n;
      queue.push({ eventId, from, to, attempt: 0 });
    }
  }

  const startedAt = Date.now();
  let tasksProcessed = 0;
  let incomplete = false;
  const MAX_RATE_LIMIT_RETRIES = 3;

  function withinBudget(): boolean {
    if (Date.now() - startedAt > timeBudgetMs) {
      incomplete = true;
      return false;
    }
    if (tasksProcessed >= maxTasks) {
      incomplete = true;
      return false;
    }
    return true;
  }

  async function processTask(t: Task): Promise<void> {
    tasksProcessed++;
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
      opts?.onProgress?.(results);
    } catch (err) {
      if (!withinBudget()) return; // don't bother retrying/splitting once we're out of budget anyway
      if (isRateLimitError(err)) {
        if (t.attempt >= MAX_RATE_LIMIT_RETRIES) return; // give up on this one window rather than throwing away everything else already found
        // Exponential backoff on the exact same window, capped low enough
        // that one stubborn window can't eat the whole time budget by
        // itself: 500ms, 1s, 2s.
        await sleep(500 * 2 ** t.attempt);
        queue.push({ ...t, attempt: t.attempt + 1 });
        return;
      }
      // Not a rate-limit error — assume the block range itself was
      // rejected as too large and split it, same as before.
      const span = t.to - t.from + 1n;
      if (span <= 250n) return; // too small to usefully split further; skip rather than throw
      const mid = t.from + span / 2n;
      queue.push({ eventId: t.eventId, from: t.from, to: mid - 1n, attempt: 0 });
      queue.push({ eventId: t.eventId, from: mid, to: t.to, attempt: 0 });
    }
  }

  async function worker(): Promise<void> {
    while (queue.length > 0 && withinBudget()) {
      const t = queue.shift();
      if (!t) return;
      await processTask(t);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, Math.max(1, queue.length)) }, () => worker()));

  return { results, incomplete: incomplete || queue.length > 0 };
}
