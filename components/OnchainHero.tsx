"use client";
import Link from "next/link";
import { useReadContract, useAccount } from "wagmi";
import { POAP_ABI } from "@/lib/abi";
import { contractAddress, DEFAULT_CHAIN } from "@/lib/contract";

export function OnchainHero() {
  const { chainId: connected } = useAccount();
  const chainId = connected ?? DEFAULT_CHAIN.id;
  const { data: total } = useReadContract({ address: contractAddress(chainId), abi: POAP_ABI, functionName: "totalEvents" });
  const events = total === undefined ? "—" : String(Number(total) + 1);

  return (
    <section className="reference-hero">
      <div className="reference-stars" aria-hidden="true">
        <i className="star s1"/><i className="star s2"/><i className="star s3"/><i className="star s4"/><i className="star s5"/>
      </div>
      <div className="reference-hero-inner">
        <div className="reference-hero-copy">
          <p className="reference-kicker">PERMANENT PROOF OF ATTENDANCE</p>
          <h1>Onchain POAPs</h1>
          <h2>Proofs that stay with you.</h2>
          <p className="reference-hero-description">
            Create, distribute, mint and collect attendance proofs whose artwork and metadata live directly onchain. Built for real events, real communities and permanent ownership.
          </p>
          <div className="reference-feature-dots" aria-label="Onchain POAP highlights">
            <span>Fully onchain</span>
            <span>ERC-1155 on Base</span>
            <span>Public, allowlist & signature minting</span>
          </div>
          <div className="reference-hero-actions">
            <Link href="/register" className="reference-outline-btn reference-primary-action">CREATE</Link>
            <Link href="/events" className="reference-outline-btn">EXPLORE</Link>
          </div>
          <div className="reference-hero-stats">
            <div><strong>{events}</strong><span>EVENTS</span></div>
            <div><strong>100%</strong><span>ONCHAIN</span></div>
            <div><strong>∞</strong><span>PERMANENCE</span></div>
          </div>
        </div>

        <div className="reference-art" aria-hidden="true">
          <div className="reference-hatch" />
          <div className="reference-capsule c1" />
          <div className="reference-capsule c2" />
          <div className="reference-capsule c3" />
          <div className="reference-capsule c4" />
          <div className="reference-capsule c5" />
          <div className="reference-capsule c6" />
          <div className="reference-orange-dot d1" />
          <div className="reference-orange-dot d2" />
          <div className="reference-orange-dot d3" />
          <div className="reference-orange-ring" />
        </div>
      </div>

      <div className="reference-hero-footer">
        <Link href="/docs">Docs</Link>
        <a href={`https://sepolia.basescan.org/address/${contractAddress(DEFAULT_CHAIN.id)}`} target="_blank" rel="noreferrer">Contract</a>
        <a href="https://github.com/Pascaline06/Onchain-poaps-frontend" target="_blank" rel="noreferrer">GitHub</a>
        <span>Base Sepolia</span>
      </div>
    </section>
  );
}
