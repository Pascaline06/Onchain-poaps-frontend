"use client";
import Link from "next/link";
import { useState } from "react";
import { ConnectWallet } from "./ConnectWallet";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  ["/", "Home"],
  ["/events", "Events"],
  ["/gallery", "Gallery"],
  ["/travelers", "Travelers"],
  ["/organizer", "Organizer"],
  ["/docs", "Docs"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="reference-nav">
      <div className="reference-nav-inner">
        <Link href="/" className="reference-brand" aria-label="Onchain POAPs home">
          <span className="reference-brand-mark">i</span>
          <span>ONCHAIN POAPS</span>
        </Link>

        <div className="reference-nav-links">
          {links.map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
        </div>

        <div className="reference-nav-actions">
          <ThemeToggle />
          <Link href="/register" className="reference-outline-btn reference-create-btn">Create</Link>
          <div className="reference-wallet"><ConnectWallet /></div>
          <button
            type="button"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            className="reference-menu-btn"
          >
            {open ? "×" : "☰"}
          </button>
        </div>
      </div>

      {open && (
        <div className="reference-mobile-menu">
          <div className="reference-mobile-menu-inner">
            {links.map(([href, label]) => (
              <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>
            ))}
            <Link href="/register" onClick={() => setOpen(false)} className="reference-mobile-accent">Create a POAP</Link>
            <div className="reference-mobile-wallet"><ConnectWallet /></div>
          </div>
        </div>
      )}
    </nav>
  );
}
