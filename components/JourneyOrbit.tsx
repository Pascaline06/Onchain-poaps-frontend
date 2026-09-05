"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { POAPArtwork } from "@/components/POAPArtwork";
import { projectGeo, resolveLocation, type GeoPoint } from "@/lib/journeyGeo";

type WorldFeature = {
  type: "Feature";
  properties?: { name?: string };
  geometry?: { type: "Polygon" | "MultiPolygon"; coordinates: any };
};

type WorldGeo = { type: "FeatureCollection"; features: WorldFeature[] };
type AtlasView = "hybrid" | "map" | "journey";

interface JourneyPoint {
  id: bigint;
  name: string;
  location: string;
  date: bigint;
  image?: string;
  geo: GeoPoint | null;
}

function formatEventDate(value: bigint, full = false) {
  if (!value || value <= 0n) return "Date not set";
  const date = new Date(Number(value) * 1000);
  if (Number.isNaN(date.getTime())) return "Date not set";
  return new Intl.DateTimeFormat("en", full
    ? { month: "short", day: "numeric", year: "numeric" }
    : { month: "short", year: "numeric" }).format(date);
}

function polygonPath(ring: number[][], width = 1000, height = 500) {
  if (!ring?.length) return "";
  return ring.map(([lon, lat], index) => {
    const { x, y } = projectGeo({ lon, lat, label: "" }, width, height);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function featurePath(feature: WorldFeature) {
  const geometry = feature.geometry;
  if (!geometry) return "";
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as number[][][]).map((ring) => polygonPath(ring)).join(" ");
  }
  if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .flatMap((polygon) => polygon.map((ring) => polygonPath(ring)))
      .join(" ");
  }
  return "";
}

function arcPath(a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const lift = Math.min(82, Math.max(24, distance * 0.22));
  const cx = (a.x + b.x) / 2;
  const cy = (a.y + b.y) / 2 - lift;
  return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`;
}

function journeyNodePosition(index: number, total: number) {
  if (total <= 1) return { x: 50, y: 50 };
  const x = 10 + (index / (total - 1)) * 80;
  const wave = [48, 23, 67, 32, 71, 42, 20, 62];
  return { x, y: wave[index % wave.length] };
}

export function JourneyOrbit({ eventIds }: { eventIds: bigint[] }) {
  const { chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;
  const [world, setWorld] = useState<WorldGeo | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [view, setView] = useState<AtlasView>("hybrid");
  const [playing, setPlaying] = useState(true);

  const { data: eventReads } = useReadContracts({
    contracts: eventIds.map((id) => ({
      address: contractAddress(chainId), abi: POAP_ABI, functionName: "events" as const, args: [id] as const,
    })),
    query: { enabled: eventIds.length > 0 },
  });

  const { data: uriReads } = useReadContracts({
    contracts: eventIds.map((id) => ({
      address: contractAddress(chainId), abi: POAP_ABI, functionName: "uri" as const, args: [id] as const,
    })),
    query: { enabled: eventIds.length > 0 },
  });

  useEffect(() => {
    let cancelled = false;
    const sources = [
      "https://cdn.jsdelivr.net/gh/holtzy/D3-graph-gallery@master/DATA/world.geojson",
      "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson",
    ];
    (async () => {
      for (const source of sources) {
        try {
          const response = await fetch(source, { cache: "force-cache" });
          if (!response.ok) continue;
          const data = await response.json() as WorldGeo;
          if (!cancelled && data?.features?.length) { setWorld(data); return; }
        } catch { /* try next source */ }
      }
      if (!cancelled) setMapFailed(true);
    })();
    return () => { cancelled = true; };
  }, []);

  const points = useMemo<JourneyPoint[]>(() => {
    return eventIds.map((id, i) => {
      const eventResult = eventReads?.[i];
      if (eventResult?.status !== "success" || !eventResult.result) return null;
      const [name, , date, location] = eventResult.result as any;
      const uriResult = uriReads?.[i];
      const meta = uriResult?.status === "success" && typeof uriResult.result === "string" ? decodeTokenUri(uriResult.result) : null;
      const locationText = location || "Location not set";
      return {
        id,
        name: name || `Event #${id.toString()}`,
        location: locationText,
        date: BigInt(date ?? 0),
        image: meta?.image,
        geo: resolveLocation(locationText),
      };
    }).filter(Boolean).sort((a, b) => Number((a as JourneyPoint).date - (b as JourneyPoint).date)) as JourneyPoint[];
  }, [eventIds, eventReads, uriReads]);

  useEffect(() => {
    if (!points.length || !playing) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = window.setInterval(() => {
      setSelected((current) => {
        const index = points.findIndex((p) => p.id.toString() === current);
        return points[(index + 1 + points.length) % points.length]?.id.toString() ?? null;
      });
    }, 2600);
    return () => window.clearInterval(timer);
  }, [playing, points]);

  const mapped = points.filter((p) => p.geo);
  const unmapped = points.length - mapped.length;
  const uniqueLocations = new Set(mapped.map((p) => p.geo!.label)).size;
  const projected = mapped.map((point) => ({ point, ...projectGeo(point.geo!, 1000, 500) }));
  const selectedPoint = points.find((p) => p.id.toString() === selected) ?? points[points.length - 1];
  const selectedIndex = Math.max(0, points.findIndex((p) => p.id === selectedPoint?.id));

  const temporalNodes = points.map((point, index) => ({ point, index, ...journeyNodePosition(index, points.length) }));
  const temporalPath = temporalNodes.length
    ? temporalNodes.map((node, index) => `${index === 0 ? "M" : "L"} ${node.x * 10} ${node.y * 3.6}`).join(" ")
    : "";

  return (
    <section id="journey-orbit" className="journey-atlas scroll-mt-24 overflow-hidden rounded-[28px] border border-ink/15 bg-[#050608] text-white shadow-2xl">
      <div className="journey-atlas-head">
        <div>
          <p className="eyebrow text-accent">ONCHAIN JOURNEY ATLAS</p>
          <h3 className="mt-2 text-2xl font-black tracking-[-.035em] sm:text-3xl">Where × when × who.</h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/55">
            One living view of your attendance history. Geography shows where you went, the journey layer shows when it happened, and every stop opens the real onchain event behind it.
          </p>
        </div>
        <div className="journey-atlas-stats">
          <span><strong>{points.length}</strong> events</span>
          <span><strong>{uniqueLocations}</strong> mapped places</span>
          {unmapped > 0 && <span className="text-white/35"><strong>{unmapped}</strong> chronology-only</span>}
        </div>
      </div>

      {eventIds.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-accent/70 bg-accent/5 text-xs font-black uppercase tracking-[.18em] text-accent">Empty</div>
          <p className="mt-5 text-sm text-white/50">Mint a POAP and your journey will begin here.</p>
        </div>
      ) : (
        <>
          <div className="journey-atlas-toolbar">
            <div className="journey-view-switch" role="group" aria-label="Journey Atlas view">
              {(["hybrid", "map", "journey"] as AtlasView[]).map((item) => (
                <button key={item} type="button" className={view === item ? "is-active" : ""} onClick={() => setView(item)}>
                  {item === "hybrid" ? "Hybrid" : item === "map" ? "Map" : "Journey"}
                </button>
              ))}
            </div>
            <button type="button" className={`journey-live-toggle ${playing ? "is-live" : ""}`} onClick={() => setPlaying((value) => !value)}>
              <span className="journey-live-dot" /> {playing ? "Live journey" : "Paused"}
            </button>
          </div>

          <div className={`journey-hybrid-stage view-${view}`}>
            {view !== "journey" && (
              <div className="journey-world-wrap">
                <div className="journey-world-grid" aria-hidden="true" />
                <svg viewBox="0 0 1000 500" className="journey-world-svg" role="img" aria-label="World map showing locations of owned Onchain POAPs">
                  <defs>
                    <radialGradient id="atlasGlow"><stop offset="0" stopColor="#ff641f" stopOpacity=".34"/><stop offset="1" stopColor="#ff641f" stopOpacity="0"/></radialGradient>
                    <filter id="atlasPinGlow"><feGaussianBlur stdDeviation="5" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                  </defs>
                  <rect width="1000" height="500" fill="transparent" />
                  {world?.features.map((feature, index) => (
                    <path key={`${feature.properties?.name ?? "country"}-${index}`} d={featurePath(feature)} className="journey-country" vectorEffect="non-scaling-stroke" />
                  ))}
                  {!world && !mapFailed && <text x="500" y="250" textAnchor="middle" className="journey-map-loading">Loading world geometry…</text>}
                  {mapFailed && <text x="500" y="250" textAnchor="middle" className="journey-map-loading">World outline unavailable — chronology remains active.</text>}

                  {projected.slice(0, -1).map((current, index) => {
                    const next = projected[index + 1];
                    return <path key={`arc-${current.point.id}`} d={arcPath(current, next)} className="journey-map-arc" pathLength="100" />;
                  })}

                  {projected.map(({ point, x, y }, index) => {
                    const isSelected = selectedPoint?.id === point.id;
                    return (
                      <g key={point.id.toString()} className={`journey-map-pin ${isSelected ? "is-selected" : ""}`} onClick={() => { setSelected(point.id.toString()); setPlaying(false); }} tabIndex={0} role="button" aria-label={`Select ${point.name}`} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setSelected(point.id.toString()); setPlaying(false); } }}>
                        <circle cx={x} cy={y} r={isSelected ? 28 : 18} fill="url(#atlasGlow)" className="journey-pin-halo" />
                        <circle cx={x} cy={y} r={isSelected ? 9 : 6} className="journey-pin-dot" filter="url(#atlasPinGlow)" />
                        <text x={x + 12} y={y - 10} className="journey-pin-index">{String(index + 1).padStart(2, "0")}</text>
                      </g>
                    );
                  })}
                </svg>

                {mapped.length === 0 && (
                  <div className="journey-map-empty-note">
                    <span className="journey-map-empty-icon">⌖</span>
                    <div><strong>Geography is waiting for a real place.</strong><small>These POAPs don’t include usable locations yet, so the Atlas keeps them in the live chronological journey instead of inventing coordinates.</small></div>
                  </div>
                )}
              </div>
            )}

            {view !== "map" && (
              <div className="journey-temporal-panel">
                <div className="journey-temporal-head">
                  <span className="eyebrow text-accent">LIVE JOURNEY</span>
                  <strong>{String(selectedIndex + 1).padStart(2, "0")} / {String(points.length).padStart(2, "0")}</strong>
                </div>
                <div className="journey-temporal-canvas">
                  <svg viewBox="0 0 1000 360" preserveAspectRatio="none" className="journey-temporal-svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="journeyRouteGradient" x1="0" x2="1"><stop offset="0" stopColor="#ff671f" stopOpacity=".12"/><stop offset=".5" stopColor="#ff671f" stopOpacity="1"/><stop offset="1" stopColor="#ffb07a" stopOpacity=".35"/></linearGradient>
                      <filter id="journeyPulseGlow"><feGaussianBlur stdDeviation="8" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                    </defs>
                    <path d={temporalPath} className="journey-temporal-track" />
                    <path id="journeyPulsePath" d={temporalPath} className="journey-temporal-live-path" pathLength="100" />
                    {playing && temporalPath && (
                      <circle r="9" className="journey-traveler-pulse" filter="url(#journeyPulseGlow)">
                        <animateMotion dur={`${Math.max(7, points.length * 1.8)}s`} repeatCount="indefinite" path={temporalPath} />
                      </circle>
                    )}
                  </svg>
                  {temporalNodes.map(({ point, index, x, y }) => {
                    const isActive = selectedPoint?.id === point.id;
                    return (
                      <button key={point.id.toString()} type="button" className={`journey-temporal-node ${isActive ? "is-active" : ""}`} style={{ left: `${x}%`, top: `${y}%` }} onClick={() => { setSelected(point.id.toString()); setPlaying(false); }} aria-label={`Select ${point.name}`}>
                        <span className="journey-temporal-art"><POAPArtwork imageDataUri={point.image} alt={point.name} className="flex h-full w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full" fallback={<span>{String(index + 1).padStart(2, "0")}</span>} /></span>
                        <span className="journey-temporal-label"><small>{formatEventDate(point.date)}</small><strong>{point.name}</strong></span>
                      </button>
                    );
                  })}
                  <div className="journey-temporal-core"><span>YOUR</span><strong>JOURNEY</strong><small>{points.length} proofs</small></div>
                </div>
                <div className="journey-temporal-legend"><span><i className="is-route" /> chronology</span><span><i className="is-proof" /> POAP proof</span><span><i className="is-selected" /> selected stop</span></div>
              </div>
            )}
          </div>

          {selectedPoint && (
            <div className="journey-selected-strip">
              <Link href={`/event/${selectedPoint.id}`} className="journey-map-selected">
                <span className="journey-map-selected-art">
                  <POAPArtwork imageDataUri={selectedPoint.image} alt={selectedPoint.name} className="flex h-full w-full items-center justify-center p-1 [&_svg]:max-h-full [&_svg]:max-w-full" fallback={<span className="text-[8px] text-white/30">POAP</span>} />
                </span>
                <span className="min-w-0">
                  <small>{formatEventDate(selectedPoint.date, true)}</small>
                  <strong>{selectedPoint.name}</strong>
                  <em>{selectedPoint.geo?.label ?? selectedPoint.location} · Open permanent event →</em>
                </span>
              </Link>
              <div className="journey-selected-meta"><span>{selectedPoint.geo ? "Mapped stop" : "Chronology-only"}</span><span>Event #{selectedPoint.id.toString()}</span></div>
            </div>
          )}

          <div className="journey-chronology">
            <div className="journey-chronology-line" aria-hidden="true" />
            {points.map((point, index) => (
              <button key={point.id.toString()} type="button" onClick={() => { setSelected(point.id.toString()); setPlaying(false); }} className={`journey-chronology-stop ${selectedPoint?.id === point.id ? "is-active" : ""}`}>
                <span className="journey-chronology-dot" />
                <span className="journey-chronology-copy">
                  <small>{formatEventDate(point.date)}</small>
                  <strong>{point.name}</strong>
                  <em>{point.geo?.label ?? point.location}</em>
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
