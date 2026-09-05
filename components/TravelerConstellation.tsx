"use client";
import { useMemo, useState } from "react";
import type { Traveler } from "@/lib/useFellowTravelers";

const MAX_NODES = 16;
function truncate(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}`; }
function ringForCount(count: number, maxCount: number) {
  if (maxCount <= 1) return 150;
  const ratio = count / maxCount;
  if (ratio >= .66) return 104;
  if (ratio >= .33) return 146;
  return 176;
}
function nodePoints(x:number,y:number,r:number,kind:number){
  if(kind===0) return `${x},${y-r} ${x+r*.86},${y-r*.5} ${x+r*.86},${y+r*.5} ${x},${y+r} ${x-r*.86},${y+r*.5} ${x-r*.86},${y-r*.5}`;
  if(kind===1) return `${x},${y-r} ${x+r},${y} ${x},${y+r} ${x-r},${y}`;
  return `${x-r*.72},${y-r} ${x+r*.72},${y-r} ${x+r},${y-r*.35} ${x+r},${y+r*.35} ${x+r*.72},${y+r} ${x-r*.72},${y+r} ${x-r},${y+r*.35} ${x-r},${y-r*.35}`;
}

export function TravelerConstellation({ travelers, eventNames }: { travelers: Traveler[]; eventNames: Map<string,string> }) {
  const shown=travelers.slice(0,MAX_NODES);
  const [selectedAddress,setSelectedAddress]=useState<string|null>(shown[0]?.address??null);
  const selected=shown.find(t=>t.address===selectedAddress)??shown[0]??null;
  const maxCount=Math.max(1,...shown.map(t=>t.sharedEventIds.length));
  const totalOverlap=shown.reduce((sum,t)=>sum+t.sharedEventIds.length,0);
  const positioned=useMemo(()=>shown.map((traveler,i)=>{
    const radius=ringForCount(traveler.sharedEventIds.length,maxCount);
    const peers=shown.filter(t=>ringForCount(t.sharedEventIds.length,maxCount)===radius);
    const peerIndex=peers.findIndex(t=>t.address===traveler.address);
    const phase=radius===104?-.12:radius===146?.13:.27;
    const angle=(peerIndex/Math.max(1,peers.length))*Math.PI*2-Math.PI/2+phase;
    return {traveler,radius,x:210+radius*Math.cos(angle),y:210+radius*Math.sin(angle),kind:i%3};
  }),[shown,maxCount]);

  const stageLabel=shown.length ? `${shown.length} verified traveler${shown.length===1?"":"s"} · ${totalOverlap} shared event signal${totalOverlap===1?"":"s"}` : "Waiting for the first verified overlap";

  return <section className="traveler-resonance-stage">
    <div className="traveler-network-copy">
      <p className="eyebrow text-accent">TRAVELER RESONANCE</p>
      <h3>The people in your orbit — shaped by proof.</h3>
      <p>Every form is driven by verified shared attendance. The core continuously changes shape as your social graph resolves; stronger overlaps sit closer and carry brighter signals.</p>
    </div>

    <div className="traveler-resonance-grid">
      <div className="traveler-resonance-canvas">
        <div className="traveler-resonance-status"><span className="traveler-live-dot"/>LIVE GRAPH <b>{stageLabel}</b></div>
        <svg viewBox="0 0 420 420" className="traveler-resonance-svg" aria-label="Animated traveler network generated from shared POAP attendance">
          <defs>
            <radialGradient id="resonanceCore" cx="50%" cy="42%"><stop offset="0" stopColor="#ffb17d"/><stop offset=".5" stopColor="#ff6b23"/><stop offset="1" stopColor="#7a2508"/></radialGradient>
            <linearGradient id="resonanceEdge" x1="0" x2="1"><stop offset="0" stopColor="#ff671f" stopOpacity=".05"/><stop offset=".55" stopColor="#ff8e51" stopOpacity=".9"/><stop offset="1" stopColor="#ff671f" stopOpacity=".12"/></linearGradient>
            <filter id="resonanceGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
            <filter id="softGlow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>

          {positioned.map(({traveler,x,y},i)=>{
            const active=selected?.address===traveler.address;
            const strength=traveler.sharedEventIds.length/maxCount;
            const cx=(210+x)/2 + (y-210)*.10;
            const cy=(210+y)/2 - (x-210)*.10;
            const d=`M210 210 Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
            return <g key={`edge-${traveler.address}`}>
              <path d={d} className={active?"traveler-resonance-edge is-active":"traveler-resonance-edge"} style={{opacity:.22+strength*.52}}/>
              <circle r={active?3.4:2.4} className="traveler-signal-pulse" style={{animationDelay:`-${i*.7}s`}}>
                <animateMotion dur={`${4.4+i*.35}s`} repeatCount="indefinite" path={d}/>
              </circle>
            </g>;
          })}

          {!shown.length && <g className="traveler-idle-satellites">
            {[[210,74],[344,210],[210,346],[76,210]].map(([x,y],i)=><g key={i}><polygon points={nodePoints(x,y,10,i%3)} className="traveler-idle-shape"/><circle cx={x} cy={y} r="18" className="traveler-idle-ring"/></g>)}
          </g>}

          <g className="traveler-prism-wrap" filter="url(#resonanceGlow)">
            <polygon className="traveler-prism-shape prism-a" points="210,56 316,96 364,210 316,324 210,364 104,324 56,210 104,96">
              <animate attributeName="points" dur="12s" repeatCount="indefinite" calcMode="spline" keySplines=".42 0 .58 1;.42 0 .58 1;.42 0 .58 1;.42 0 .58 1"
                values="210,56 316,96 364,210 316,324 210,364 104,324 56,210 104,96;
                        210,40 252,128 376,102 286,210 376,318 252,292 210,380 168,292 44,318 134,210 44,102 168,128;
                        210,48 350,126 326,210 350,294 210,372 70,294 94,210 70,126;
                        210,36 266,112 356,146 310,232 266,376 210,340 154,376 110,232 64,146 154,112;
                        210,56 316,96 364,210 316,324 210,364 104,324 56,210 104,96"/>
            </polygon>
            <circle cx="210" cy="210" r="40" className="traveler-core-lens"/>
            <text x="210" y="207" textAnchor="middle" className="traveler-core-title">YOU</text>
            <text x="210" y="222" textAnchor="middle" className="traveler-core-sub">{shown.length?`${shown.length} SIGNALS`:"WAITING"}</text>
          </g>

          {positioned.map(({traveler,x,y,kind},i)=>{
            const active=selected?.address===traveler.address;
            const strength=traveler.sharedEventIds.length/maxCount;
            const size=10+strength*6;
            return <g key={traveler.address} role="button" tabIndex={0} className={active?"traveler-resonance-node is-active":"traveler-resonance-node"} onClick={()=>setSelectedAddress(traveler.address)} onKeyDown={e=>{if(e.key==="Enter"||e.key===" ")setSelectedAddress(traveler.address)}}>
              {active&&<circle cx={x} cy={y} r={size+14} className="traveler-node-selected-halo"/>}
              <polygon points={nodePoints(x,y,size,kind)} className="traveler-node-shape" filter={active?"url(#softGlow)":undefined}/>
              <circle cx={x} cy={y} r="3.2" className="traveler-node-core"/>
              <text x={x} y={y+size+16} textAnchor="middle" className="traveler-node-label">{traveler.sharedEventIds.length} SHARED</text>
              <text x={x} y={y+size+27} textAnchor="middle" className="traveler-node-address">{truncate(traveler.address)}</text>
            </g>;
          })}
        </svg>
        <div className="traveler-resonance-legend"><span><i className="shape-hex"/>Strong overlap</span><span><i className="shape-diamond"/>Repeated paths</span><span><i className="shape-ticket"/>First crossings</span></div>
      </div>

      <aside className="traveler-network-aside">
        <div className="traveler-selected-card traveler-resonance-card">
          <p className="eyebrow">SELECTED SIGNAL</p>
          {selected?<><strong className="traveler-address">{truncate(selected.address)}</strong><span className="traveler-shared-count">{selected.sharedEventIds.length} verified shared event{selected.sharedEventIds.length===1?"":"s"}</span><div className="traveler-shared-events">{selected.sharedEventIds.map(id=><span key={id.toString()}>{eventNames.get(id.toString())??`POAP #${id}`}</span>)}</div><div className="traveler-signal-meter"><span style={{width:`${Math.max(16,(selected.sharedEventIds.length/maxCount)*100)}%`}}/></div><small>Signal strength is derived only from shared attendance.</small><a href={`https://sepolia.basescan.org/address/${selected.address}`} target="_blank" rel="noreferrer">Verify wallet on BaseScan ↗</a></>:<><div className="traveler-waiting-glyph"><i/><i/><i/></div><strong className="traveler-address">No overlap yet</strong><p className="traveler-empty-copy">When another wallet owns one of the same POAPs, the first verified traveler signal will lock into this graph.</p></>}
        </div>
        {shown.length>0&&<div className="traveler-closest-list"><p className="eyebrow">STRONGEST SIGNALS</p>{[...shown].sort((a,b)=>b.sharedEventIds.length-a.sharedEventIds.length).slice(0,4).map((t,i)=><button key={t.address} onClick={()=>setSelectedAddress(t.address)}><span>{String(i+1).padStart(2,"0")}</span><strong>{truncate(t.address)}</strong><em>{t.sharedEventIds.length} shared</em></button>)}</div>}
      </aside>
    </div>
  </section>;
}
