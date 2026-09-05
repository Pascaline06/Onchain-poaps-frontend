"use client";
import { useMemo, useState } from "react";
import type { Traveler } from "@/lib/useFellowTravelers";

const MAX_NODES = 20;
function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }
function ringForCount(count: number, maxCount: number) {
  if (maxCount <= 1) return 150;
  const ratio = count / maxCount;
  if (ratio >= .75) return 88;
  if (ratio >= .4) return 132;
  return 170;
}

export function TravelerConstellation({ travelers, eventNames }: { travelers: Traveler[]; eventNames: Map<string,string> }) {
  const [selected,setSelected]=useState<Traveler|null>(travelers[0]??null);
  const shown=travelers.slice(0,MAX_NODES);
  const maxCount=Math.max(1,...shown.map(t=>t.sharedEventIds.length));
  const positioned=useMemo(()=>shown.map((traveler,i)=>{
    const radius=ringForCount(traveler.sharedEventIds.length,maxCount);
    const ringPeers=shown.filter(t=>ringForCount(t.sharedEventIds.length,maxCount)===radius);
    const peerIndex=ringPeers.findIndex(t=>t.address===traveler.address);
    const angle=(peerIndex/Math.max(1,ringPeers.length))*Math.PI*2-Math.PI/2+(radius===132?.16:radius===170?.28:0);
    return {traveler,radius,x:210+radius*Math.cos(angle),y:210+radius*Math.sin(angle)};
  }),[shown,maxCount]);

  if (!shown.length) return <div className="traveler-constellation-empty"><span className="eyebrow text-accent">FELLOW TRAVELERS</span><h3>No shared paths yet.</h3><p>When another wallet claims one of the same POAPs, that verified overlap will appear here.</p></div>;

  return <section className="traveler-network-stage">
    <div className="traveler-network-copy">
      <p className="eyebrow text-accent">FELLOW TRAVELER CONSTELLATION</p>
      <h3>Your attendance graph.</h3>
      <p>Distance represents how often you crossed paths. The closer a wallet sits to you, the more events you share.</p>
    </div>
    <div className="traveler-network-grid">
      <div className="traveler-constellation-canvas">
        <svg viewBox="0 0 420 420" className="w-full" aria-label="Network of wallets that attended the same events">
          <defs>
            <radialGradient id="travelerCore"><stop offset="0" stopColor="#ff8c4f"/><stop offset="1" stopColor="#ff5616"/></radialGradient>
            <filter id="travelerGlow"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          {[88,132,170].map((r,i)=><circle key={r} cx="210" cy="210" r={r} className={`traveler-orbit-ring ring-${i+1}`} />)}
          {positioned.map(({traveler,x,y})=>{
            const strength=traveler.sharedEventIds.length/maxCount;
            const active=selected?.address===traveler.address;
            return <g key={`line-${traveler.address}`}><line x1="210" y1="210" x2={x} y2={y} className="traveler-edge" style={{opacity:.18+strength*.48}} />{active&&<line x1="210" y1="210" x2={x} y2={y} className="traveler-edge-active" />}</g>;
          })}
          <circle cx="210" cy="210" r="32" fill="rgba(255,103,31,.11)" className="traveler-core-halo" />
          <circle cx="210" cy="210" r="22" fill="url(#travelerCore)" filter="url(#travelerGlow)" />
          <text x="210" y="214" textAnchor="middle" className="traveler-you-label">YOU</text>
          {positioned.map(({traveler,x,y})=>{
            const active=selected?.address===traveler.address;
            const size=8+(traveler.sharedEventIds.length/maxCount)*8;
            return <g key={traveler.address} role="button" tabIndex={0} className="traveler-node" onClick={()=>setSelected(traveler)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setSelected(traveler)}}>
              {active&&<circle cx={x} cy={y} r={size+11} className="traveler-node-selected-halo" />}
              <circle cx={x} cy={y} r={size} className={active?"traveler-node-dot is-active":"traveler-node-dot"} />
              <text x={x} y={y+size+15} textAnchor="middle" className="traveler-node-label">{traveler.sharedEventIds.length} shared</text>
            </g>;
          })}
        </svg>
        <div className="traveler-ring-legend"><span><i/>Close travelers</span><span><i/>Familiar faces</span><span><i/>Crossed paths</span></div>
      </div>
      <aside className="traveler-network-aside">
        <div className="traveler-selected-card">
          <p className="eyebrow">SELECTED TRAVELER</p>
          {selected?<><strong className="traveler-address">{truncate(selected.address)}</strong><span className="traveler-shared-count">{selected.sharedEventIds.length} shared event{selected.sharedEventIds.length===1?"":"s"}</span><div className="traveler-shared-events">{selected.sharedEventIds.map(id=><span key={id.toString()}>{eventNames.get(id.toString())??`POAP #${id}`}</span>)}</div><a href={`https://sepolia.basescan.org/address/${selected.address}`} target="_blank" rel="noreferrer">Verify wallet on BaseScan ↗</a></>:<p>Tap a node to inspect the overlap.</p>}
        </div>
        <div className="traveler-closest-list"><p className="eyebrow">CLOSEST TRAVELERS</p>{travelers.slice(0,4).map((t,i)=><button key={t.address} onClick={()=>setSelected(t)}><span>{String(i+1).padStart(2,"0")}</span><strong>{truncate(t.address)}</strong><em>{t.sharedEventIds.length} shared</em></button>)}</div>
      </aside>
    </div>
  </section>;
}
