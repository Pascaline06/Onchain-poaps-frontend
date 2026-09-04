import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const sections = [
  ["overview", "How Onchain POAPs works"],
  ["creating", "Creating a POAP"],
  ["metadata", "Metadata & onchain artwork"],
  ["svg", "SVG requirements & optimization"],
  ["soulbound", "Soulbound vs transferable"],
  ["public", "Public minting"],
  ["allowlist", "Allowlists & Merkle proofs"],
  ["signature", "Signature minting"],
  ["qr", "QR distribution for live events"],
  ["creator", "Creator permissions & deadlines"],
  ["minting", "Minting & verification"],
  ["gallery", "Gallery"],
  ["passport", "Event Passport"],
  ["travelers", "Traveler Network"],
  ["orbit", "Journey Orbit"],
  ["organizer", "Organizer Command Center"],
  ["reputation", "Organizer reputation"],
  ["proof", "POAP Proof Card"],
  ["farcaster", "Farcaster Mini App"],
  ["developer", "Developer & deployment notes"],
] as const;

function DocSection({id,title,children}:{id:string;title:string;children:ReactNode}) {
  return <section id={id} className="docs-section scroll-mt-24"><h2>{title}</h2>{children}</section>;
}

export default function DocsPage() {
  return (
    <main>
      <Nav />
      <div className="docs-shell">
        <aside className="docs-sidebar">
          <p className="docs-sidebar-label">ON THIS PAGE</p>
          {sections.map(([id,title]) => <a key={id} href={`#${id}`}>{title}</a>)}
        </aside>

        <article className="docs-article">
          <header className="docs-hero">
            <p className="eyebrow text-accent">ONCHAIN POAPS DOCUMENTATION</p>
            <h1>Everything you need to create, distribute, mint and verify POAPs.</h1>
            <p>
              This guide explains the protocol in plain language for event organizers, attendees and developers.
              The smart contract remains the source of truth; the frontend is designed to expose its existing
              functionality without changing the contract.
            </p>
          </header>

          <nav className="docs-mobile-index">
            {sections.map(([id,title]) => <a key={id} href={`#${id}`}>{title}</a>)}
          </nav>

          <DocSection id="overview" title="How Onchain POAPs works">
            <p>
              Onchain POAPs is an ERC-1155 attendance system on Base. An organizer registers an event and its SVG
              artwork, chooses how people may claim it, and receives a permanent event ID. Attendees then mint a
              token using one of the enabled distribution methods. The artwork and metadata are read from the
              contract, so the POAP can be independently inspected without relying on a traditional image server.
            </p>
            <div className="docs-callout"><strong>The basic flow:</strong> Register → Configure distribution → Mint → Verify → Collect in your Passport.</div>
          </DocSection>

          <DocSection id="creating" title="Creating a POAP">
            <p>
              Open <strong>Create</strong> and connect the wallet that should own the organizer permissions. The
              registration form supports the contract's event name, description, date, location, external project
              URL, SVG artwork, allowlist root, soulbound setting and public-mint setting.
            </p>
            <ol>
              <li>Enter the event name and optional descriptive metadata.</li>
              <li>Upload or paste a valid SVG. The app previews it before you register.</li>
              <li>Choose whether the token should be soulbound or transferable.</li>
              <li>Choose whether public minting starts open.</li>
              <li>If you already have a Merkle root, add it during registration; otherwise configure an allowlist later from Manage.</li>
              <li>Review the complete event preview and confirm the wallet transaction.</li>
            </ol>
            <p>After confirmation, the event receives an onchain event ID and the registering wallet becomes its creator.</p>
          </DocSection>

          <DocSection id="metadata" title="Metadata & onchain artwork">
            <p>
              Each event exposes an ERC-1155 token URI through the contract's <code>uri(eventId)</code> function.
              The frontend decodes that URI to display the original event artwork and metadata in Events, Gallery,
              Passport, Proof and Organizer views. Existing event artwork is never replaced by generic frontend art.
            </p>
            <p>
              This is an important distinction: the visual identity you register for an event remains the artwork
              users see throughout the product.
            </p>
          </DocSection>

          <DocSection id="svg" title="SVG requirements & optimization">
            <p>
              Registration expects SVG artwork. Because the SVG is stored onchain, smaller files generally mean a
              more efficient registration transaction. The Create flow optimizes SVGs with SVGO before submission
              and shows the result so you can verify that the artwork still looks correct.
            </p>
            <p>
              Keep unnecessary metadata, hidden layers and editor-specific markup out of the SVG. Preserve a
              <code>viewBox</code> so the artwork scales correctly across the gallery, proof card and mobile Mini App.
            </p>
          </DocSection>

          <DocSection id="soulbound" title="Soulbound vs transferable">
            <p>
              A <strong>soulbound</strong> POAP is meant to represent attendance tied to the wallet that earned it.
              It can be minted and burned, but not transferred between normal wallet addresses. A transferable POAP
              behaves more like a collectible and may move between wallets.
            </p>
            <div className="docs-callout"><strong>Practical rule:</strong> use soulbound when you want the token to mean “this wallet attended.” Use transferable only when movement between wallets is intentional.</div>
          </DocSection>

          <DocSection id="public" title="Public minting">
            <p>
              Public minting is the simplest distribution method. When it is enabled, any eligible wallet may call
              <code>mint(eventId)</code>. The event page makes the current state visible and the creator can open or
              close public minting from the Manage page while the contract's creator window is still active.
            </p>
            <p>Use it for open meetups, public conferences and community events where no pre-approval is needed.</p>
          </DocSection>

          <DocSection id="allowlist" title="Allowlists & Merkle proofs">
            <p>
              An allowlist is for a known set of recipients. Instead of putting every address onchain, the app builds
              a Merkle tree in the browser and stores only its root in the contract. Each recipient uses a Merkle proof
              to show that their address belongs to the approved list.
            </p>
            <ol>
              <li>Open the creator's <strong>Manage</strong> page.</li>
              <li>Paste recipient addresses, one per line or comma-separated.</li>
              <li>Build the allowlist. The tool validates and de-duplicates the addresses.</li>
              <li>Review the generated root and download the proof data.</li>
              <li>Submit the root onchain only when the list is final.</li>
              <li>Give each attendee the proof associated with their own address.</li>
            </ol>
            <p>
              Eligible attendees mint through <code>allowlistMint(eventId, proof)</code>. The app hides the Merkle-tree
              complexity behind a guided workflow so an organizer can go from “I have a list of wallets” to a working
              allowlist without manually calculating hashes.
            </p>
          </DocSection>

          <DocSection id="signature" title="Signature minting">
            <p>
              Signature minting is useful when the organizer does not know every attendee in advance. The creator
              authorizes a recipient offchain by signing the event/recipient payload, and the recipient submits that
              signature with <code>mintWithSignature</code>.
            </p>
            <p>
              This is especially useful at live events because it avoids publishing a fully open mint while still
              giving specific attendees a claim path. The Manage interface explains the signature window and generates
              the link needed by the recipient.
            </p>
          </DocSection>

          <DocSection id="qr" title="QR distribution for live events">
            <p>
              The signature workflow can turn a prepared mint link into a QR code. Put that QR on a screen, badge,
              poster or check-in desk. Scanning it opens the event mint page with the signature data already supplied,
              reducing the number of steps an attendee must perform on-site.
            </p>
            <p>
              The dedicated <strong>QR Kiosk</strong> view gives organizers a cleaner event-day experience than using
              the full dashboard on a public display.
            </p>
          </DocSection>

          <DocSection id="creator" title="Creator permissions & deadlines">
            <p>
              The wallet that registers an event is the creator. Creator-only actions include changing public-mint
              status, configuring the allowlist within the contract's allowed window, generating valid signature
              authorizations and using creator mint/airdrop flows.
            </p>
            <ul>
              <li><strong>Creator-management window:</strong> the contract exposes a creator timelock used by the management UI.</li>
              <li><strong>Allowlist root:</strong> treat it as a one-time configuration and verify the list before submitting it.</li>
              <li><strong>Signature minting:</strong> the UI shows its separate expiration window and countdown.</li>
              <li><strong>One claim per wallet per event:</strong> claim state is checked onchain with <code>hasClaimed</code>.</li>
            </ul>
          </DocSection>

          <DocSection id="minting" title="Minting & verification">
            <p>
              Before a mint, the event page shows the artwork and metadata so the attendee can see exactly what they
              are claiming. Depending on the event, the mint panel exposes public mint, allowlist mint or signature mint.
            </p>
            <p>
              After confirmation, ownership can be checked directly against the ERC-1155 contract and the app provides
              external verification links such as BaseScan/OpenSea where appropriate. The Proof Card goes further by
              turning the same onchain data into a shareable verification artifact.
            </p>
          </DocSection>

          <DocSection id="gallery" title="Gallery">
            <p>
              Gallery is the collection view. It reads the connected wallet's claim state, renders each POAP's original
              onchain artwork and metadata, and links to the full event detail page. It is designed to feel like a real
              attendance collection rather than a raw transaction log.
            </p>
          </DocSection>

          <DocSection id="passport" title="Event Passport">
            <p>
              The Event Passport transforms the connected wallet's POAP collection into a coherent attendance journey.
              It summarizes total POAPs, events, locations and organizers, then presents the collection as passport-style
              spreads instead of a simple grid.
            </p>
            <p>
              Passport entries are generated from the same live event data used elsewhere in the app. Pages can be
              exported as shareable images, giving attendees a visually memorable record of where they have shown up.
            </p>
          </DocSection>

          <DocSection id="travelers" title="Traveler Network">
            <p>
              Traveler Network makes attendance social without inventing an offchain profile database. It identifies
              wallets that minted the same events as the connected user by reading verified mint history for the events
              they share.
            </p>
            <p>
              The result is a “fellow travelers” view that shows the people you crossed paths with and the events you
              have in common. This turns POAP ownership into a lightweight onchain identity and community-discovery layer.
            </p>
          </DocSection>

          <DocSection id="orbit" title="Journey Orbit">
            <p>
              Journey Orbit is the visual centerpiece of the new attendance experience. Every owned event becomes a
              point orbiting the user's journey, turning a flat token list into a visual map of participation.
            </p>
            <p>
              It is intentionally derived from real owned event IDs and their contract metadata rather than decorative
              mock data. The Orbit appears alongside the Passport and Traveler experiences so the visualization stays grounded
              in verifiable attendance.
            </p>
          </DocSection>

          <DocSection id="organizer" title="Organizer Command Center">
            <p>
              The Organizer page gathers all events created by the connected wallet into one operational dashboard.
              It reads creator ownership, event supply and event metadata from the contract and exposes fast routes to
              the actions an organizer actually needs.
            </p>
            <ul>
              <li>Total events created.</li>
              <li>Total POAP claims and average claims per event.</li>
              <li>Per-event artwork, location and live supply.</li>
              <li>Direct links to Manage, QR Kiosk and the public event page.</li>
              <li>One-click route to create another event.</li>
            </ul>
          </DocSection>

          <DocSection id="reputation" title="Organizer reputation">
            <p>
              Organizer Reputation is a transparent activity layer built from observable onchain participation rather
              than a hidden rating. The current score uses the organizer's number of created events and total attendee
              claims to summarize demonstrated activity.
            </p>
            <p>
              It is not a financial score and it does not change contract permissions. Its purpose is to help attendees
              quickly understand whether an organizer has a meaningful event history on the protocol.
            </p>
          </DocSection>

          <DocSection id="proof" title="POAP Proof Card">
            <p>
              The Proof Card is a visually polished verification receipt for an owned POAP. It combines the original
              event artwork, event name, location/date, wallet, event ID and Base network label with a verification QR.
            </p>
            <p>
              Ownership is checked onchain before the card is shown. Users can download the card, share it to Farcaster
              or X, and open the external verification target. The card is therefore useful socially without asking the
              viewer to trust a screenshot alone.
            </p>
          </DocSection>

          <DocSection id="farcaster" title="Farcaster Mini App">
            <p>
              The same frontend is designed to work as both a normal website and a Farcaster Mini App. The Mini App keeps
              the core flows usable on mobile: connect, explore events, view artwork, mint, open Passport/Travelers and
              share proof. The project includes the Farcaster manifest under <code>public/.well-known/farcaster.json</code>.
            </p>
            <p>
              Before submitting the bounty, deploy the final build, verify the Mini App inside Farcaster, publish the
              required cast, tag the requested bounty contributors, and include the deployed app and GitHub links.
            </p>
          </DocSection>

          <DocSection id="developer" title="Developer & deployment notes">
            <ul>
              <li>The supplied smart contract is not modified by this frontend.</li>
              <li>Contract reads/writes go through the ABI in <code>lib/abi.ts</code> and configured Base contract address.</li>
              <li>Run <code>npm install</code>, then <code>npm run build</code> in a supported Node/Linux environment before deployment.</li>
              <li>Termux/Android may fail Next.js SWC native builds even when TypeScript is valid; Vercel builds in its normal Linux environment.</li>
              <li>Run <code>npx tsc --noEmit</code> for a quick TypeScript validation.</li>
              <li>Do not commit private keys or production secrets. Use environment variables.</li>
            </ul>
          </DocSection>
        </article>
      </div>
      <Footer />
    </main>
  );
}
