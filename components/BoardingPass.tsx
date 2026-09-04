"use client";
import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { usePassportEntryData } from "@/lib/usePassportEntryData";
import { formatEventDate } from "./PassportEntry";
import { POAPArtwork } from "./POAPArtwork";
import { exportBoardingPass } from "@/lib/exportBoardingPass";
import { openSeaUrl, baseScanTxUrl, shortAddress } from "@/lib/links";

export function BoardingPass({eventId,owner,chainId,txHash,justMinted}:{eventId:bigint;owner:`0x${string}`;chainId:number;txHash?:`0x${string}`;justMinted?:boolean;}) {
  const data=usePassportEntryData(eventId); const [downloading,setDownloading]=useState(false); const qrRef=useRef<HTMLCanvasElement>(null);
  const verifyUrl=openSeaUrl(chainId,eventId); const appUrl=typeof window!=="undefined"?window.location.href:"";
  const shareText=`Verified attendance: ${data.name||`Onchain POAP #${eventId.toString()}`} — permanently onchain.`;
  const castIntentUrl=`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds[]=${encodeURIComponent(appUrl)}`;
  const tweetIntentUrl=`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(appUrl)}`;
  async function handleDownload(){setDownloading(true);try{await exportBoardingPass({data,eventId,owner,filename:`onchain-poap-proof-${eventId.toString()}.png`,qrDataUrl:qrRef.current?.toDataURL("image/png")})}finally{setDownloading(false)}}
  if(!data.loaded)return <div className="h-72 animate-pulse rounded-3xl bg-ink/5"/>;
  return <div>
    {justMinted&&<p className="mb-4 text-center text-sm font-bold text-accent">Mint confirmed — your proof is ready.</p>}
    <div className="proof-card noise relative overflow-hidden rounded-[28px] border border-white/10 p-5 text-white shadow-2xl sm:p-7">
      <div className="orange-hatch absolute -right-20 -top-24 h-72 w-72 rotate-12 rounded-full opacity-70"/>
      <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-accent/15 blur-3xl"/>
      <div className="relative z-10 grid gap-6 md:grid-cols-[180px_1fr_132px] md:items-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3"><POAPArtwork imageDataUri={data.image} alt={data.name||"POAP"} className="flex aspect-square w-full items-center justify-center [&_svg]:max-h-full [&_svg]:max-w-full" fallback={<div className="aspect-square rounded-xl border border-dashed border-white/20"/>}/></div>
        <div><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.18em] text-[#ff8b4c]"><span>✓</span> Verified attendee</div><h2 className="text-3xl font-black leading-[.98] tracking-[-.045em] sm:text-4xl">{data.name||"Onchain POAP"}</h2><p className="mt-3 text-sm font-semibold text-white/60">{[data.location,formatEventDate(data.eventDate)].filter(Boolean).join(" · ")||"Permanent attendance record"}</p><div className="mt-6 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3"><div><p className="text-[9px] font-black uppercase tracking-widest text-white/35">Traveler</p><p className="mt-1 font-mono font-bold">{shortAddress(owner)}</p></div><div><p className="text-[9px] font-black uppercase tracking-widest text-white/35">Event</p><p className="mt-1 font-mono font-bold">#{eventId.toString()}</p></div><div><p className="text-[9px] font-black uppercase tracking-widest text-white/35">Network</p><p className="mt-1 font-mono font-bold">BASE</p></div></div><div className="mt-6 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/55"><span className="text-[#8cff9a]">✓ Verified onchain</span><span>•</span><span>ERC-1155</span><span>•</span><span>Artwork onchain</span></div></div>
        <div className="flex items-center gap-3 md:flex-col"><div className="rounded-xl bg-white p-2"><QRCodeCanvas ref={qrRef} value={verifyUrl} size={96} level="M" fgColor="#080808" bgColor="#ffffff"/></div><p className="font-mono text-[9px] uppercase tracking-[.18em] text-white/40">Scan to verify</p></div>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={handleDownload} disabled={downloading} className="btn-primary text-sm">{downloading?"Preparing…":"Download proof"}</button><a href={castIntentUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">Share on Farcaster</a><a href={tweetIntentUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">Share on X</a><a href={verifyUrl} target="_blank" rel="noreferrer" className="btn-secondary text-sm">OpenSea ↗</a>{txHash&&<a href={baseScanTxUrl(txHash)} target="_blank" rel="noreferrer" className="btn-secondary text-sm">BaseScan ↗</a>}</div>
  </div>;
}
