"use client";
import { useMemo, useState } from "react";
import type { Traveler } from "@/lib/useFellowTravelers";

const MAX_NODES = 20;

function truncate(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Three rings by connection strength, rather than continuous distance —
// continuous placement looks nice but is nearly impossible to actually
// read at a glance ("is that node 60% or 65% of the way out?"). Discrete
// tiers are legible; the tier itself is the information.
function ringForCount(count: number, maxCount: number): { radius: number; label: string } {
  if (maxCount <= 1) return { radius: 150, label: "Crossed paths once" };
  const ratio = count / maxCount;
  if (ratio >= 0.75) return { radius: 85, label: "Close travelers" };
  if (ratio >= 0.4) return { radius: 130, label: "Familiar faces" };
  return { radius: 170, label: "Crossed paths" };
}

export function TravelerConstellation({
  travelers,
  eventNames,
}: {
  travelers: Traveler[];
  eventNames: Map<string, string>;
}) {
  const [selected, setSelected] = useState<Traveler | null>(null);
  const shown = travelers.slice(0, MAX_NODES);
  const overflow = travelers.length - shown.length;
  const maxCount = Math.max(1, ...shown.map((t) => t.sharedEventIds.length));

  const positioned = useMemo(() => {
    return shown.map((t, i) => {
      const angle = (i / shown.length) * Math.PI * 2 - Math.PI / 2;
      const { radius, label } = ringForCount(t.sharedEventIds.length, maxCount);
      return {
        traveler: t,
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        radius,
        ringLabel: label,
      };
    });
  }, [shown, maxCount]);

  if (shown.length === 0) {
    return (
      <div className="card flex h-80 flex-col items-center justify-center gap-2 p-8 text-center">
        <span className="stamp text-xs">NO OVERLAP YET</span>
        <p className="mt-3 max-w-xs text-sm text-ink/60">
          Nobody else has minted the same POAPs as you yet — mint something a few other people have
          claimed too, and they'll show up here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
      <div className="card flex items-center justify-center overflow-hidden p-4">
        <svg viewBox="0 0 400 400" className="w-full max-w-md">
          {/* Connection lines, drawn first so they sit under the nodes */}
          {positioned.map(({ traveler, x, y }) => {
            const strength = traveler.sharedEventIds.length / maxCount;
            return (
              <line
                key={`line-${traveler.address}`}
                x1={200}
                y1={200}
                x2={x}
                y2={y}
                stroke="#ff5a1f"
                strokeWidth={1 + strength * 3}
                strokeOpacity={0.25 + strength * 0.5}
              />
            );
          })}

          {/* Reference rings, faint */}
          {[85, 130, 170].map((r) => (
            <circle key={r} cx={200} cy={200} r={r} fill="none" stroke="#f2ede4" strokeOpacity={0.08} />
          ))}

          {/* You, at the center */}
          <g>
            <circle cx={200} cy={200} r={26} fill="#1c1c1f" stroke="#ff5a1f" strokeWidth={3} />
            <text x={200} y={205} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#ff5a1f" fontFamily="Georgia, serif">
              YOU
            </text>
          </g>

          {positioned.map(({ traveler, x, y }) => {
            const isSelected = selected?.address === traveler.address;
            const size = 10 + (traveler.sharedEventIds.length / maxCount) * 8;
            return (
              <g
                key={traveler.address}
                onClick={() => setSelected(isSelected ? null : traveler)}
                className="cursor-pointer"
              >
                <circle
                  cx={x}
                  cy={y}
                  r={size}
                  fill={isSelected ? "#ff5a1f" : "#f2ede4"}
                  fillOpacity={isSelected ? 1 : 0.85}
                  stroke="#1c1c1f"
                  strokeWidth={2}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="space-y-4">
        <div>
          <p className="font-display text-lg font-semibold">
            {travelers.length} fellow traveler{travelers.length === 1 ? "" : "s"}
          </p>
          <p className="text-xs text-ink/50">
            Tap a point to see what you share. {overflow > 0 ? `Showing the ${MAX_NODES} closest — ${overflow} more not pictured.` : ""}
          </p>
        </div>

        {selected ? (
          <div className="card p-4">
            <p className="font-mono text-sm font-semibold text-accent">{truncate(selected.address)}</p>
            <p className="mt-1 text-xs text-ink/50">
              {selected.sharedEventIds.length} shared POAP{selected.sharedEventIds.length === 1 ? "" : "s"}
            </p>
            <ul className="mt-3 space-y-1.5">
              {selected.sharedEventIds.map((id) => (
                <li key={id.toString()} className="text-sm text-ink/80">
                  · {eventNames.get(id.toString()) ?? `POAP #${id}`}
                </li>
              ))}
            </ul>
            <a
              href={`https://sepolia.basescan.org/address/${selected.address}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-xs text-ink/40 underline hover:text-accent"
            >
              View on BaseScan
            </a>
          </div>
        ) : (
          <div className="card p-4 text-sm text-ink/50">
            Nobody selected yet — tap any point in the constellation.
          </div>
        )}
      </div>
    </div>
  );
}
