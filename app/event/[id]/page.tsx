"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { POAPArtwork } from "@/components/POAPArtwork";
import { MintPanel } from "@/components/MintPanel";
import { OrganizerReputation } from "@/components/OrganizerReputation";
import { Countdown } from "@/components/Countdown";
import { EventVerificationPanel } from "@/components/EventVerificationPanel";
import { LiveAttendancePulse } from "@/components/LiveAttendancePulse";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { decodeTokenUri } from "@/lib/metadata";
import { baseScanAddressUrl, shortAddress } from "@/lib/links";

export default function EventPage(){
  const params=useParams<{id:string}>(); const id=BigInt(params.id);
  const search=useSearchParams();
  const prefillSig=search.get("sig") ?? "";
  const {chainId:connected}=useAccount(); const chainId=connected??DEFAULT_CHAIN.id;
  const {data:evt}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"events",args:[id]});
  const {data:uri}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"uri",args:[id]});
  const {data:supply}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"totalSupply",args:[id]});
  const {data:total}=useReadContract({address:contractAddress(chainId),abi:POAP_ABI,functionName:"totalEvents"});
  const allIds=useMemo(()=>total===undefined?[]:Array.from({length:Number(total)+1},(_,i)=>BigInt(i)),[total]);
  const {data:all}=useReadContracts({contracts:allIds.map(x=>({address:contractAddress(chainId),abi:POAP_ABI,functionName:"events" as const,args:[x] as const})),query:{enabled:allIds.length>0}});
  const creatorAddress=(evt as any)?.[6] as string | undefined;
  const organizerEventIds=(all??[]).map((r,i)=>r.status==="success"&&r.result&&creatorAddress&&(r.result as any)[6]?.toLowerCase()===creatorAddress.toLowerCase()?allIds[i]:null).filter((x):x is bigint=>x!==null);
  const {data:organizerSupplies}=useReadContracts({contracts:organizerEventIds.map(x=>({address:contractAddress(chainId),abi:POAP_ABI,functionName:"totalSupply" as const,args:[x] as const})),query:{enabled:organizerEventIds.length>0}});
  if(!evt) return <main><Nav/><div className="mx-auto max-w-4xl px-6 py-24 text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent"/><p className="mt-4 text-ink/50">Reading this event directly from Base…</p></div><Footer/></main>;
  const [name,description,eventDate,location,allowlistRoot,,creator,createdAt,externalUrl,isSoulbound,isPublic]=evt as any;
  const meta=uri?decodeTokenUri(uri):null;
  const organizerClaims=(organizerSupplies??[]).reduce((n,r)=>n+(r.status==="success"?Number(r.result):0),0);
  const organizerEvents=organizerEventIds.length;
  const date=eventDate?new Date(Number(eventDate)*1000).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}):"Date not set";
  return <main><Nav/><div className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
    <Link href="/events" className="text-xs font-bold text-ink/45 hover:text-accent">← Back to events</Link>
    <div className="mt-7 grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
      <div className="noise relative flex min-h-[430px] items-center justify-center overflow-hidden rounded-3xl bg-[#080808] p-8"><div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl"/><div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl"><POAPArtwork imageDataUri={meta?.image} alt={name} className="flex aspect-square w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full" fallback={<div className="text-sm text-white/30">Artwork unavailable</div>}/></div></div>
      <div><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-accent">VERIFIED ONCHAIN</span>{isSoulbound&&<span className="rounded-full bg-ink/10 px-3 py-1 text-[10px] font-bold">SOULBOUND</span>}{isPublic&&<span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent">PUBLIC MINT</span>}{allowlistRoot!=="0x0000000000000000000000000000000000000000000000000000000000000000"&&<span className="rounded-full bg-ink/10 px-3 py-1 text-[10px] font-bold">ALLOWLIST</span>}<Countdown createdAt={createdAt} kind="creator"/><Countdown createdAt={createdAt} kind="signature"/></div>
        <h1 className="mt-5 max-w-3xl text-5xl font-black tracking-[-.045em] sm:text-6xl">{name||`POAP #${params.id}`}</h1><p className="mt-4 text-lg font-medium text-ink/55">{description||"A permanent proof-of-attendance record."}</p>
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="card p-4"><b className="stat-number">{supply===undefined?"—":Number(supply).toLocaleString()}</b><p className="eyebrow mt-1">POAPs minted</p></div><div className="card p-4"><b className="stat-number">{date.split(",")[0]}</b><p className="eyebrow mt-1">Event date</p></div><div className="card p-4"><b className="text-lg font-black">{location||"—"}</b><p className="eyebrow mt-2">Location</p></div><div className="card p-4"><b className="text-lg font-black">#{params.id}</b><p className="eyebrow mt-2">Event ID</p></div></div>
        <div className="mt-8"><LiveAttendancePulse eventId={id} chainId={chainId} eventName={name||`POAP #${params.id}`}/></div>
        <div className="mt-6"><MintPanel eventId={id} evt={{name,isPublic,isSoulbound,allowlistRoot,createdAt,creator}} prefillSig={prefillSig}/></div>
        {prefillSig&&<p className="mt-3 rounded-xl border border-accent/20 bg-accent/5 p-3 text-xs font-semibold text-ink/60">Signature authorization detected from your QR/link. Connect the matching recipient wallet and mint.</p>}
        <div className="mt-8"><EventVerificationPanel eventId={id} creator={creator} supply={Number(supply??0)} isSoulbound={Boolean(isSoulbound)} isPublic={Boolean(isPublic)} hasAllowlist={allowlistRoot!=="0x0000000000000000000000000000000000000000000000000000000000000000"} metadataPresent={Boolean(meta)}/></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2"><OrganizerReputation creator={creator} events={organizerEvents||1} attendees={organizerClaims||Number(supply??0)}/><div className="card p-5"><p className="eyebrow">Verify independently</p><p className="mt-2 text-sm font-semibold">Contract creator: {shortAddress(creator)}</p><p className="mt-1 text-xs text-ink/45">The record can be inspected without trusting this frontend.</p><a href={baseScanAddressUrl(creator)} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold hover:border-accent hover:text-accent">View creator on BaseScan ↗</a><a href={baseScanAddressUrl(contractAddress(chainId))} target="_blank" rel="noreferrer" className="ml-2 mt-4 inline-flex rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold hover:border-accent hover:text-accent">View contract ↗</a>{externalUrl&&<a href={externalUrl} target="_blank" rel="noreferrer" className="ml-2 mt-4 inline-flex rounded-xl border border-ink/20 px-4 py-2 text-xs font-bold">Event link ↗</a>}</div></div>
        <Link href={`/event/${params.id}/manage`} className="mt-6 inline-flex text-sm font-bold text-accent">Creator? Manage this POAP →</Link>
      </div>
    </div>
  </div><Footer/></main>;
}
