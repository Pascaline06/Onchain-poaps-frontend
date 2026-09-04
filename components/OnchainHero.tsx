"use client";
import Link from "next/link";
import { useReadContract } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";
import { useAccount } from "wagmi";

export function OnchainHero() {
  const { chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;
  const { data: total } = useReadContract({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "totalEvents" });
  const events = total === undefined ? "—" : String(Number(total) + 1);
  return (
    <section className="relative overflow-hidden bg-[#050505] px-6 py-14 text-white sm:py-20">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
        <div className="relative z-10">
          <span className="mb-6 inline-flex rounded-full border border-white/20 px-4 py-2 font-mono text-[10px] font-bold uppercase tracking-[.2em] text-white/70">PERMANENT PROOF OF ATTENDANCE</span>
          <h1 className="max-w-xl text-5xl font-black leading-[.92] tracking-[-.045em] sm:text-7xl">Your Journey.<br/>Onchain<br/><span className="text-[#ff6b1a]">Forever.</span></h1>
          <p className="mt-7 max-w-lg text-base font-medium leading-relaxed text-white/65 sm:text-lg">Create, collect and verify attendance records whose artwork and metadata live directly onchain. Your events become part of a permanent public history.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link href="/register" className="rounded-xl bg-[#ff6b1a] px-6 py-3.5 font-bold text-white shadow-lg shadow-orange-950/30">Create a POAP</Link><Link href="/events" className="rounded-xl border border-white/25 px-6 py-3.5 font-bold text-white hover:bg-white/10">Explore Events</Link></div>
          <div className="mt-12 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-6"><div><div className="text-2xl font-black">{events}</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Events</div></div><div><div className="text-2xl font-black">100%</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Onchain</div></div><div><div className="text-2xl font-black">∞</div><div className="text-[10px] font-bold uppercase tracking-widest text-white/45">Persistence</div></div></div>
        </div>
        <div className="hero-orbital relative min-h-[420px] overflow-hidden sm:min-h-[520px]">
          <div className="hero-dot right-[32%] top-[10%] h-5 w-5"/><div className="hero-dot right-[22%] top-[2%] h-8 w-8"/><div className="hero-dot right-[45%] top-[23%] h-3 w-3"/><div className="hero-dot right-[13%] bottom-[16%] h-8 w-8"/>
          {[1,2,3,4,5].map(i=><div key={i} className="hero-ribbon"/>)}
          <div className="absolute bottom-8 left-12 rounded-full border border-white/10 bg-white/5 px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-white/55 backdrop-blur">Base Sepolia · ERC-1155</div>
        </div>
      </div>
    </section>
  );
}
