"use client";
import Link from "next/link";
import { useMemo } from "react";
import { useAccount,useReadContract,useReadContracts } from "wagmi";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ConnectWallet } from "@/components/ConnectWallet";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress,DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { POAPArtwork } from "@/components/POAPArtwork";
import { OrganizerReputation, organizerActivityScore } from "@/components/OrganizerReputation";
import { OrganizerAnalytics } from "@/components/OrganizerAnalytics";

export default function OrganizerPage(){
 const {address,chainId:connected}=useAccount(); const chainId=connected??DEFAULT_CHAIN.id;
 const {data:total}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"totalEvents"});
 const ids=useMemo(()=>total===undefined?[]:Array.from({length:Number(total)+1},(_,i)=>BigInt(i)),[total]);
 const {data:events}=useReadContracts({contracts:ids.map(id=>({address:contractAddress(chainId),abi:POAP_ABI,functionName:"events" as const,args:[id] as const})),query:{enabled:ids.length>0}});
 const mine=useMemo(()=>{if(!address||!events)return [];return events.map((r,i)=>r.status==="success"&&r.result&&(r.result as any)[6]?.toLowerCase()===address.toLowerCase()?{id:ids[i],evt:r.result as any}:null).filter(Boolean) as {id:bigint;evt:any}[]},[address,events,ids]);
 const {data:supplies}=useReadContracts({contracts:mine.map(x=>({address:contractAddress(chainId),abi:POAP_ABI,functionName:"totalSupply" as const,args:[x.id] as const})),query:{enabled:mine.length>0}});
 const totalClaims=(supplies??[]).reduce((n,r)=>n+(r.status==="success"?Number(r.result):0),0);
 const score=organizerActivityScore(mine.length,totalClaims);
 const analyticsEvents=mine.map(({id,evt},i)=>{const supplyResult=supplies?.[i];return {id,name:evt[0]||`Event #${id}`,claims:supplyResult?.status==="success"?Number(supplyResult.result):0,isPublic:Boolean(evt[10]),hasAllowlist:evt[4]!=="0x0000000000000000000000000000000000000000000000000000000000000000",eventDate:BigInt(evt[2]??0)}});
 return <main><Nav/><div className="reference-page-shell"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="eyebrow text-accent">ORGANIZER COMMAND CENTER</p><h1 className="reference-page-title">Run every event<br/>from one place.</h1><p className="reference-page-lead">Create, distribute, manage, verify and measure your onchain attendance without leaving the protocol workflow.</p></div><Link href="/register" className="btn-primary">+ Create event</Link></div>
 {!address?<div className="card mx-auto mt-10 max-w-xl p-10 text-center"><p className="font-bold">Connect your organizer wallet to open your command center.</p><div className="mt-4"><ConnectWallet/></div></div>:<>
 <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><div className="card p-5"><div className="stat-number">{mine.length}</div><p className="eyebrow mt-1">Events created</p></div><div className="card p-5"><div className="stat-number">{totalClaims.toLocaleString()}</div><p className="eyebrow mt-1">POAP claims</p></div><div className="card p-5"><div className="stat-number">{mine.length?Math.round(totalClaims/mine.length):0}</div><p className="eyebrow mt-1">Avg. claims/event</p></div><div className="card p-5"><div className="stat-number text-accent">{score}</div><p className="eyebrow mt-1">Activity score</p></div></div>
 <div id="organizer-reputation" className="mt-5 scroll-mt-24"><OrganizerReputation creator={address} events={mine.length} attendees={totalClaims}/></div>
 <div className="mt-8"><OrganizerAnalytics events={analyticsEvents}/></div>
 <div className="mt-8"><div className="mb-4"><p className="eyebrow">LIVE EVENT PORTFOLIO</p><h2 className="mt-1 text-2xl font-black tracking-[-.03em]">Manage your events</h2></div>{mine.length===0?<div className="card p-10 text-center text-ink/50">You haven't created an event on this contract yet.</div>:<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{mine.map(({id,evt},i)=>{const supplyResult=supplies?.[i];const supply=supplyResult?.status==="success"?Number(supplyResult.result):undefined;return <div key={id.toString()} className="card overflow-hidden p-4"><Link href={`/event/${id}`} className="block"><div className="flex h-48 items-center justify-center overflow-hidden rounded-xl bg-ink/5"><EventArt id={id}/></div><div className="mt-4 flex items-start justify-between gap-3"><div><h3 className="font-black">{evt[0]}</h3><p className="mt-1 text-xs text-ink/45">{evt[3]||"No location"}</p></div><span className="rounded-full bg-accent/10 px-2 py-1 text-[9px] font-black text-accent">{supply===undefined?"—":supply} CLAIMS</span></div></Link><div className="mt-4 grid grid-cols-3 gap-2"><Link href={`/event/${id}/manage`} className="rounded-full bg-accent px-3 py-2 text-center text-[10px] font-black text-white">Manage</Link><Link href={`/event/${id}/kiosk`} className="rounded-full border border-ink/20 px-3 py-2 text-center text-[10px] font-bold hover:border-accent hover:text-accent">QR Kiosk</Link><Link href={`/event/${id}`} className="rounded-full border border-ink/20 px-3 py-2 text-center text-[10px] font-bold hover:border-accent hover:text-accent">View</Link></div></div>})}</div>}</div>
 </>}
 </div><Footer/></main>;
}
function EventArt({id}:{id:bigint}){const {chainId:connected}=useAccount();const chainId=connected??DEFAULT_CHAIN.id;const {data:uri}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"uri",args:[id]});const meta=uri?decodeTokenUri(uri):null;return <POAPArtwork imageDataUri={meta?.image} alt={meta?.name||"POAP"} className="flex h-full w-full items-center justify-center p-3 [&_svg]:max-h-full [&_svg]:max-w-full" fallback={<span className="text-xs text-ink/30">Artwork</span>}/>}
