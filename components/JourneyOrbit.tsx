"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { POAPArtwork } from "@/components/POAPArtwork";

interface JourneyPoint {
  id: bigint;
  name: string;
  location: string;
  date: bigint;
  image?: string;
  radius: string;
  duration: number;
  startAngle: number;
}

export function JourneyOrbit({ eventIds }: { eventIds: bigint[] }) {
  const { chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;

  const { data: eventReads } = useReadContracts({
    contracts: eventIds.map((id) => ({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "events" as const,
      args: [id] as const,
    })),
    query: { enabled: eventIds.length > 0 },
  });

  const { data: uriReads } = useReadContracts({
    contracts: eventIds.map((id) => ({
      address: contractAddress(chainId),
      abi: POAP_ABI,
      functionName: "uri" as const,
      args: [id] as const,
    })),
    query: { enabled: eventIds.length > 0 },
  });

  const points = useMemo<JourneyPoint[]>(() => {
    const total = Math.max(1, eventIds.length);
    return eventIds
      .map((id, i) => {
        const eventResult = eventReads?.[i];
        if (eventResult?.status !== "success" || !eventResult.result) return null;
        const [name, , date, location] = eventResult.result as any;
        const uriResult = uriReads?.[i];
        const meta = uriResult?.status === "success" && typeof uriResult.result === "string"
          ? decodeTokenUri(uriResult.result)
          : null;

        // Alternate rings so larger collections stay legible rather than stacking on one circle.
        const ring = i % 2;
        const radius = ring === 0
          ? "clamp(98px, 31vw, 174px)"
          : "clamp(132px, 41vw, 226px)";
        // More events make the constellation feel slightly more energetic, while remaining calm.
        const duration = Math.max(18, 30 - Math.min(total, 12) * 0.55 + ring * 5);
        const startAngle = (i / total) * 360 - 90;

        return {
          id,
          name: name || `Event #${id.toString()}`,
          location: location || "Onchain",
          date,
          image: meta?.image,
          radius,
          duration,
          startAngle,
        };
      })
      .filter(Boolean) as JourneyPoint[];
  }, [eventIds, eventReads, uriReads]);

  return (
    <section id="journey-orbit" className="scroll-mt-24 overflow-hidden rounded-3xl border border-ink/15 bg-[#070707] text-white shadow-2xl">
      <div className="border-b border-white/10 px-5 py-5 sm:px-7">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[.24em] text-[#ff641f]">
          ONCHAIN JOURNEY ORBIT
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black tracking-[-.035em]">Your attendance, in motion.</h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-white/50">
              Every orbiting stamp is a POAP you actually own. Your collection moves as one living attendance constellation — tap any stamp to open its original onchain record.
            </p>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white/50">
            {eventIds.length} {eventIds.length === 1 ? "event" : "events"} mapped
          </span>
        </div>
      </div>

      {eventIds.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <div className="journey-core-empty mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff641f] text-xs font-black uppercase tracking-widest text-[#ff641f]">
            Empty
          </div>
          <p className="mt-5 text-sm text-white/50">Mint a POAP and your first event will appear here.</p>
        </div>
      ) : (
        <>
          <div className="journey-orbit-stage relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden" aria-label="Animated map of your owned POAPs">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,100,31,.17),transparent_40%)]" />
            <div className="journey-orbit-halo absolute left-1/2 top-1/2 h-[56%] w-[56%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10" />
            <div className="journey-orbit-halo journey-orbit-halo-slow absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />
            <div className="journey-orbit-sweep absolute left-1/2 top-1/2 h-[82%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-full" />

            <div className="journey-core absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#ff641f] bg-[#111] text-center shadow-[0_0_60px_rgba(255,100,31,.24)] sm:h-28 sm:w-28">
              <span className="relative z-10 text-[10px] font-black uppercase tracking-[.18em]">Your<br />Journey</span>
              <span className="journey-core-ring" aria-hidden="true" />
            </div>

            {points.map((point, index) => (
              <div
                key={point.id.toString()}
                className="journey-orbit-anchor absolute left-1/2 top-1/2"
                style={{
                  ["--orbit-radius" as any]: point.radius,
                  ["--orbit-duration" as any]: `${point.duration}s`,
                  ["--orbit-start" as any]: `${point.startAngle}deg`,
                }}
              >
                <div className="journey-orbit-rotator">
                  <div className="journey-orbit-radius">
                    <Link
                      href={`/event/${point.id}`}
                      title={`${point.name} — ${point.location}`}
                      aria-label={`Open ${point.name}`}
                      className="journey-orbit-node group block"
                    >
                      <div className="journey-orbit-upright">
                        <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-[#ff641f] bg-[#141414] shadow-[0_0_24px_rgba(255,100,31,.45)] transition duration-300 group-hover:scale-110 group-focus-visible:scale-110 sm:h-14 sm:w-14">
                          <POAPArtwork
                            imageDataUri={point.image}
                            alt={point.name}
                            className="flex h-full w-full items-center justify-center p-1 [&_svg]:max-h-full [&_svg]:max-w-full"
                            fallback={<span className="text-xs font-black text-[#ff641f]">{index + 1}</span>}
                          />
                        </div>
                        <span className="absolute -bottom-2 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#ff641f] px-1 text-[9px] font-black text-white">
                          {index + 1}
                        </span>
                        <span className="journey-orbit-tooltip pointer-events-none absolute left-1/2 top-full z-20 mt-4 w-max max-w-[180px] -translate-x-1/2 rounded-xl border border-white/10 bg-black/90 px-3 py-2 text-center opacity-0 shadow-xl transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                          <span className="block max-w-[160px] truncate text-xs font-black text-white">{point.name}</span>
                          <span className="mt-0.5 block max-w-[160px] truncate text-[10px] text-white/50">{point.location}</span>
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}

            <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
              <span className="rounded-full border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[.18em] text-white/40 backdrop-blur">
                Live constellation · {points.length} owned stamp{points.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="border-t border-white/10 p-4 sm:p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {points.map((point, index) => (
                <Link
                  key={`row-${point.id.toString()}`}
                  href={`/event/${point.id}`}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition-colors hover:border-[#ff641f]/50 hover:bg-white/[0.06]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ff641f]/15 text-xs font-black text-[#ff641f]">
                    {index + 1}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black">{point.name}</span>
                    <span className="block truncate text-[11px] text-white/45">{point.location}</span>
                  </span>
                  <span className="ml-auto text-[#ff641f]">→</span>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
