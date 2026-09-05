"use client";

import { useEffect, useMemo, useState } from "react";
import { usePublicClient, useReadContract, useWatchContractEvent } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress } from "@/lib/contract";
import { fetchMintLogsForEvents } from "@/lib/mintLogs";

const short = (address: string) => `${address.slice(0, 6)}…${address.slice(-4)}`;

type Arrival = { recipient: `0x${string}`; blockNumber: bigint; live?: boolean };

export function LiveAttendancePulse({
  eventId,
  chainId,
  eventName,
}: {
  eventId: bigint;
  chainId: number;
  eventName: string;
}) {
  const publicClient = usePublicClient({ chainId: 84532 });
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [historyIncomplete, setHistoryIncomplete] = useState(false);
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaying, setReplaying] = useState(false);

  const { data: liveSupply } = useReadContract({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    functionName: "totalSupply",
    args: [eventId],
    query: { refetchInterval: 5000 },
  });

  useEffect(() => {
    if (!publicClient) return;
    let cancelled = false;
    fetchMintLogsForEvents(publicClient, contractAddress(chainId), [eventId], {
      lookbackBlocks: 1_200_000n,
      chunkSize: 150_000n,
      concurrency: 2,
      timeBudgetMs: 6500,
      maxTasks: 72,
    }).then(({ results, incomplete }) => {
      if (cancelled) return;
      const rows = (results.get(eventId.toString()) ?? [])
        .map((x) => ({ ...x }))
        .sort((a, b) => (a.blockNumber < b.blockNumber ? -1 : a.blockNumber > b.blockNumber ? 1 : 0));
      setArrivals(rows);
      setHistoryIncomplete(incomplete);
      setReplayIndex(Math.max(0, rows.length - 1));
    }).catch(() => {
      if (!cancelled) setHistoryIncomplete(true);
    });
    return () => { cancelled = true; };
  }, [publicClient, chainId, eventId]);

  useWatchContractEvent({
    address: contractAddress(chainId),
    abi: POAP_ABI,
    eventName: "NewMint",
    args: { eventId },
    onLogs(logs) {
      const next: Arrival[] = logs.flatMap((log: any) => {
        const recipient = log.args?.recipient as `0x${string}` | undefined;
        if (!recipient) return [];
        return [{ recipient, blockNumber: log.blockNumber ?? 0n, live: true }];
      });
      if (!next.length) return;
      setArrivals((prev) => {
        const keyed = new Map(prev.map((x) => [`${x.recipient}-${x.blockNumber}`, x]));
        next.forEach((x) => keyed.set(`${x.recipient}-${x.blockNumber}`, x));
        return [...keyed.values()].sort((a, b) => (a.blockNumber < b.blockNumber ? -1 : a.blockNumber > b.blockNumber ? 1 : 0));
      });
    },
  });

  useEffect(() => {
    if (!replaying || mode !== "replay" || arrivals.length === 0) return;
    const timer = window.setInterval(() => {
      setReplayIndex((current) => {
        if (current >= arrivals.length - 1) {
          setReplaying(false);
          return current;
        }
        return current + 1;
      });
    }, 780);
    return () => window.clearInterval(timer);
  }, [replaying, mode, arrivals.length]);

  const displayed = mode === "replay" ? arrivals.slice(0, replayIndex + 1) : arrivals;
  const latest = displayed.at(-1) ?? null;
  const dots = useMemo(() => {
    const count = Math.min(28, Math.max(6, displayed.length || Number(liveSupply ?? 0)));
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const ring = i % 3;
      const radius = 73 + ring * 29;
      return { x: 150 + Math.cos(angle) * radius, y: 150 + Math.sin(angle) * radius, i };
    });
  }, [displayed.length, liveSupply]);

  const startReplay = () => {
    setMode("replay");
    setReplayIndex(0);
    setReplaying(arrivals.length > 1);
  };

  return (
    <section className="attendance-pulse-shell" id="live-attendance-pulse">
      <div className="attendance-pulse-head">
        <div>
          <p className="eyebrow text-accent">LIVE ATTENDANCE PULSE</p>
          <h2>Watch the room become onchain.</h2>
          <p>Every verified mint joins this event signal. Switch to Replay to watch the attendance record rebuild itself from the first claim forward.</p>
        </div>
        <div className="attendance-pulse-tabs" role="tablist" aria-label="Attendance view">
          <button className={mode === "live" ? "is-active" : ""} onClick={() => { setMode("live"); setReplaying(false); }}>● Live</button>
          <button className={mode === "replay" ? "is-active" : ""} onClick={startReplay}>↻ Replay</button>
        </div>
      </div>

      <div className="attendance-pulse-grid">
        <div className="attendance-pulse-visual">
          <div className="attendance-pulse-orb" aria-hidden="true">
            <svg viewBox="0 0 300 300">
              <defs>
                <radialGradient id="pulseCore" cx="50%" cy="45%"><stop offset="0" stopColor="#ffb17f"/><stop offset=".48" stopColor="#ff671f"/><stop offset="1" stopColor="#401106"/></radialGradient>
              </defs>
              <circle cx="150" cy="150" r="118" className="attendance-wave wave-a"/>
              <circle cx="150" cy="150" r="91" className="attendance-wave wave-b"/>
              {dots.map((d) => <circle key={d.i} cx={d.x} cy={d.y} r={d.i === dots.length - 1 ? 6.5 : 4.3} className={d.i === dots.length - 1 ? "attendance-dot latest" : "attendance-dot"} style={{ animationDelay: `-${d.i * .17}s` }} />)}
              <path d="M150 56 L223 91 L244 169 L194 234 L112 239 L56 179 L72 98 Z" className="attendance-core-shape">
                <animate attributeName="d" dur="10s" repeatCount="indefinite" values="M150 56 L223 91 L244 169 L194 234 L112 239 L56 179 L72 98 Z;M150 42 L191 104 L259 122 L211 179 L225 249 L154 222 L91 258 L96 186 L41 137 L111 119 Z;M150 52 L232 112 L220 209 L150 252 L69 206 L66 112 Z;M150 56 L223 91 L244 169 L194 234 L112 239 L56 179 L72 98 Z"/>
              </path>
              <circle cx="150" cy="150" r="48" className="attendance-core-hole"/>
              <text x="150" y="145" textAnchor="middle" className="attendance-core-number">{mode === "replay" ? displayed.length : Number(liveSupply ?? displayed.length)}</text>
              <text x="150" y="164" textAnchor="middle" className="attendance-core-label">VERIFIED CLAIMS</text>
            </svg>
          </div>
          <div className="attendance-live-strip"><span className="attendance-live-led"/>{mode === "live" ? "LISTENING TO BASE" : replaying ? `REPLAYING ${replayIndex + 1}/${arrivals.length}` : "REPLAY READY"}</div>
        </div>

        <aside className="attendance-pulse-side">
          <div className="attendance-pulse-stat"><span>Event</span><strong>{eventName}</strong></div>
          <div className="attendance-pulse-stat"><span>Onchain supply</span><strong>{liveSupply === undefined ? "—" : Number(liveSupply).toLocaleString()}</strong></div>
          <div className="attendance-pulse-stat"><span>{mode === "live" ? "Latest arrival" : "Replay cursor"}</span><strong>{latest ? short(latest.recipient) : "Waiting for first claim"}</strong>{latest && <small>Block {latest.blockNumber.toString()}</small>}</div>
          <div className="attendance-replay-controls">
            <button onClick={startReplay} disabled={!arrivals.length}>Replay from start</button>
            {mode === "replay" && <button onClick={() => setReplaying((v) => !v)} disabled={arrivals.length < 2}>{replaying ? "Pause" : "Continue"}</button>}
          </div>
          {historyIncomplete && <p className="attendance-history-note">Replay uses the verified mint history returned within the RPC time budget, so very old claims may be omitted.</p>}
        </aside>
      </div>

      <div className="attendance-arrival-rail" aria-label="Recent verified arrivals">
        {(displayed.length ? displayed.slice(-8) : []).map((row, i) => <div key={`${row.recipient}-${row.blockNumber}-${i}`} className={i === Math.min(7, displayed.length - 1) ? "attendance-arrival is-current" : "attendance-arrival"}><span>{String(Math.max(1, displayed.length - Math.min(8, displayed.length) + i + 1)).padStart(2, "0")}</span><strong>{short(row.recipient)}</strong><small>block {row.blockNumber.toString()}</small></div>)}
        {!displayed.length && <div className="attendance-empty-arrivals">No verified claims found yet. The pulse will react when the next attendee mints.</div>}
      </div>
    </section>
  );
}
