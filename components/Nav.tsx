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

const featureLinks = [
  ["/passport", "Event Passport", "Your permanent attendance record"],
  ["/passport#journey-orbit", "Journey Atlas", "Map owned POAPs by place and time"],
  ["/passport#onchain-timeline", "Onchain Timeline", "Read your attendance history chronologically"],
  ["/travelers", "Traveler Network", "Find wallets that attended with you"],
  ["/travelers#traveler-reputation", "Traveler Reputation", "Participation score without financial weighting"],
  ["/organizer", "Organizer Command Center", "Create, manage and measure events"],
  ["/organizer#organizer-reputation", "Organizer Reputation", "Onchain activity and claim score"],
  ["/organizer#organizer-analytics", "Organizer Analytics", "Claims, distribution mix and portfolio signal"],
  ["/proof", "POAP Proof Cards", "Share and verify attendance proof"],
] as const;

export function Nav() {
  const [open, setOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const closeAll = () => { setOpen(false); setFeaturesOpen(false); };

  return (
    <nav className="reference-nav">
      <div className="reference-nav-inner">
        <Link href="/" className="reference-brand" aria-label="Onchain POAPs home">
          <span className="reference-brand-mark">i</span>
          <span>ONCHAIN POAPS</span>
        </Link>

        <div className="reference-nav-links">
          {links.slice(0, 3).map(([href, label]) => (
            <Link key={href} href={href}>{label}</Link>
          ))}
          <div className="reference-features-wrap">
            <button
              type="button"
              className="reference-features-trigger"
              aria-expanded={featuresOpen}
              onClick={() => setFeaturesOpen(v => !v)}
            >
              Features <span aria-hidden="true">⌄</span>
            </button>
            {featuresOpen && (
              <div className="reference-features-popover">
                <p className="reference-features-label">BUILT-IN FEATURES</p>
                {featureLinks.map(([href, label, description]) => (
                  <Link key={`${href}-${label}`} href={href} onClick={closeAll}>
                    <strong>{label}</strong>
                    <span>{description}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          {links.slice(3).map(([href, label]) => (
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
            <div className="reference-mobile-primary">
              {links.map(([href, label]) => (
                <Link key={href} href={href} onClick={closeAll}>{label}</Link>
              ))}
            </div>

            <div className="reference-mobile-feature-panel">
              <p className="reference-mobile-feature-label">BUILT-IN FEATURES</p>
              <div className="reference-mobile-feature-grid">
                {featureLinks.map(([href, label, description]) => (
                  <Link key={`${href}-${label}`} href={href} onClick={closeAll}>
                    <span className="reference-mobile-feature-arrow">↗</span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </Link>
                ))}
              </div>
            </div>

            <div className="reference-mobile-cta-row">
              <Link href="/register" onClick={closeAll} className="reference-mobile-accent">Create a POAP</Link>
              <div className="reference-mobile-wallet"><ConnectWallet /></div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
