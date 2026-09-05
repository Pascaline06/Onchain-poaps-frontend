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

          <g className="traveler-resonance-field">
            {[116,156,188].map((r,i)=><ellipse key={r} cx="210" cy="210" rx={r} ry={r*(.72+i*.04)} className={`traveler-field-ring field-${i+1}`}/>) }
            <path d="M46 210 C110 115 310 115 374 210 C310 305 110 305 46 210Z" className="traveler-field-arc"/>
            <path d="M210 42 C302 105 302 315 210 378 C118 315 118 105 210 42Z" className="traveler-field-arc arc-b"/>
          </g>

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
            <polygon className="traveler-prism-shadow" points="210,118 270,143 302,210 270,277 210,302 150,277 118,210 150,143"/>
            <polygon className="traveler-prism-shape prism-a" points="210,122 272,146 296,210 272,274 210,298 148,274 124,210 148,146">
              <animate attributeName="points" dur="13s" repeatCount="indefinite"
                values="210,122 272,146 296,210 272,274 210,298 148,274 124,210 148,146;
                        210,110 240,171 308,151 257,210 308,269 240,249 210,310 180,249 112,269 163,210 112,151 180,171;
                        210,128 283,156 283,194 309,210 283,226 283,264 210,292 137,264 137,226 111,210 137,194 137,156;
                        210,114 256,153 302,178 276,225 252,294 210,276 168,294 144,225 118,178 164,153 210,114 210,114;
                        210,122 272,146 296,210 272,274 210,298 148,274 124,210 148,146 210,122 210,122 210,122 210,122"/>
            </polygon>
            <polygon className="traveler-prism-shape prism-b" points="210,146 259,169 274,210 259,251 210,274 161,251 146,210 161,169"/>
            <polygon className="traveler-prism-shape prism-c" points="210,166 247,188 247,232 210,254 173,232 173,188"/>
            <circle cx="210" cy="210" r="34" className="traveler-core-lens"/>
            <text x="210" y="207" textAnchor="middle" className="traveler-core-title">YOU</text>
            <text x="210" y="220" textAnchor="middle" className="traveler-core-sub">{shown.length?`${shown.length} SIGNALS`:"WAITING"}</text>
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
