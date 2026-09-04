"use client";
import Link from "next/link";
import { useState } from "react";
import { ConnectWallet } from "./ConnectWallet";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  ["/", "Home"],
  ["/gallery", "Gallery"],
  ["/events", "Events"],
  ["/travelers", "Travelers"],
  ["/organizer", "Organizer"],
  ["/docs", "Docs"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="sticky top-0 z-50 border-b border-ink/10 bg-paper/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 text-sm font-black tracking-[-.02em] sm:text-base">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-[10px] font-black text-white shadow-[0_8px_24px_rgba(255,90,31,.28)]">OP</span>
          <span>ONCHAIN POAPS</span>
        </Link>
        <div className="hidden items-center gap-6 text-xs font-bold lg:flex">
          {links.map(([href,label]) => <Link key={href} href={href} className="transition hover:text-accent">{label}</Link>)}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/register" className="hidden rounded-full border border-ink/25 px-4 py-2 text-xs font-bold transition hover:border-accent hover:text-accent sm:inline-flex">Create</Link>
          <div className="hidden sm:block"><ConnectWallet /></div>
          <button type="button" aria-label="Open navigation" aria-expanded={open} onClick={()=>setOpen(v=>!v)} className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 text-lg font-bold lg:hidden">{open ? "×" : "☰"}</button>
        </div>
      </div>
      {open && <div className="border-t border-ink/10 bg-paper px-4 py-4 lg:hidden"><div className="mx-auto grid max-w-7xl grid-cols-2 gap-2">{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)} className="rounded-xl border border-ink/10 px-4 py-3 text-sm font-bold hover:border-accent hover:text-accent">{label}</Link>)}<Link href="/register" onClick={()=>setOpen(false)} className="rounded-xl bg-accent px-4 py-3 text-sm font-black text-white">Create POAP</Link><div className="flex items-center rounded-xl border border-ink/10 px-3"><ConnectWallet /></div></div></div>}
    </nav>
  );
}
