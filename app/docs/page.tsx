import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

const sections = [
  { id: "creating", title: "Creating a POAP" },
  { id: "metadata", title: "POAP metadata" },
  { id: "svg", title: "SVG requirements & optimization" },
  { id: "soulbound", title: "Soulbound POAPs" },
  { id: "public", title: "Public minting" },
  { id: "allowlist", title: "Allowlists" },
  { id: "proofs", title: "Generating allowlist proofs" },
  { id: "signature", title: "Signature minting" },
  { id: "qr", title: "QR-code distribution" },
  { id: "permissions", title: "Creator permissions" },
  { id: "deadlines", title: "Minting deadlines" },
  { id: "restrictions", title: "Contract restrictions" },
  { id: "verify", title: "Verifying a minted POAP" },
  { id: "passport", title: "The Passport" },
  { id: "boarding-pass", title: "The Boarding Pass" },
  { id: "travelers", title: "Fellow Travelers" },
  { id: "palette", title: "Generative-ink palettes" },
];

export default function DocsPage() {
  return (
    <main>
      <Nav />
      <div className="mx-auto flex max-w-5xl gap-10 px-6 py-12">
        <aside className="hidden w-56 shrink-0 md:block">
          <div className="sticky top-6 space-y-1 text-sm">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block text-ink/60 hover:text-accent">
                {s.title}
              </a>
            ))}
          </div>
        </aside>

        <article className="prose max-w-none space-y-12">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Docs</h1>
            <p className="mt-2 text-lg text-ink/60">
              Not a summary — every rule, limit, and deadline on this page matches <code>Poap.sol</code>
              line for line. If something here turns out to be wrong, the contract is right and this page
              needs fixing, not the other way around.
            </p>
          </div>

          <nav className="card p-4 md:hidden">
            <p className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-ink/50">On this page</p>
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-ink/70 hover:text-accent">
                  {s.title}
                </a>
              ))}
            </div>
          </nav>

          <section id="creating">
            <h2 className="font-display text-xl font-semibold">Creating a POAP</h2>
            <p>
              Registering costs one onchain transaction and requires: a name (1–128 characters), an SVG
              image, and optionally a description (≤512 chars), location (≤128 chars), event date, and
              external URL (≤128 chars). You also choose whether the POAP is soulbound and whether
              public minting starts open. The transaction assigns you a new, permanent event ID and
              makes you that event's creator — a role that matters for the next 30–37 days (see
              Deadlines below).
            </p>
          </section>

          <section id="metadata">
            <h2 className="font-display text-xl font-semibold">POAP metadata</h2>
            <p>
              There is no IPFS pin, no metadata server, and nothing that can go offline. The contract's
              <code> uri(eventId)</code> function builds a complete ERC-1155 metadata JSON on the fly —
              name, description, image, external URL, and attributes (Event, Location, Date, EventId,
              Multichain EventId, Creator, Soulbound) — and returns it Base64-encoded as a
              <code> data:application/json;base64,...</code> URI. Marketplaces and wallets decode this
              directly; nothing needs to be fetched from anywhere else.
            </p>
          </section>

          <section id="svg">
            <h2 className="font-display text-xl font-semibold">SVG requirements & optimization</h2>
            <p>
              Your artwork must be a valid SVG string. It gets Base64-encoded and written onchain via
              SSTORE2 — you pay gas roughly proportional to its byte size, once, at registration. The
              registration form runs your SVG through SVGO automatically (multipass, default preset,
              with <code>viewBox</code> preserved so it stays responsive) and shows you the size
              reduction before you submit. You can also optimize manually first at{" "}
              <a className="text-accent2 underline" href="https://jakearchibald.github.io/svgomg/" target="_blank" rel="noreferrer">
                SVGOMG
              </a>{" "}
              if you want more control over the settings.
            </p>
          </section>

          <section id="soulbound">
            <h2 className="font-display text-xl font-semibold">Soulbound POAPs</h2>
            <p>
              A soulbound POAP can be minted and burned, but never transferred between wallets — the
              contract enforces this at the token-transfer level, not just in the UI, by reverting any
              transfer where both <code>from</code> and <code>to</code> are non-zero addresses. This is
              the right default for attendance proof: it should mean "this wallet was there," not "this
              wallet currently holds a token someone else earned." Turn it off only if you actually want
              a tradeable collectible.
            </p>
          </section>

          <section id="public">
            <h2 className="font-display text-xl font-semibold">Public minting</h2>
            <p>
              When enabled, any wallet can call <code>mint(eventId)</code> and receive exactly one POAP
              — the contract tracks claims per address per event and reverts a second attempt. You can
              open or close public minting at any time within the 30-day creator window; after that, the
              status is frozen wherever you last left it.
            </p>
          </section>

          <section id="allowlist">
            <h2 className="font-display text-xl font-semibold">Allowlists</h2>
            <p>
              An allowlist restricts minting to a specific, pre-defined set of addresses without storing
              that whole list onchain (which would be expensive and fully public). Instead, the contract
              stores one 32-byte "Merkle root" that represents the entire list, and each eligible address
              mints by submitting a "proof" — a short array of hashes specific to their address — that
              the contract checks against that root.
            </p>
            <p>
              The tradeoff to understand: <strong>you can only set the allowlist root once per event,
              and only within 30 days of registering it.</strong> There's no "add one more person"
              afterward — if your list changes, either mint directly to stragglers with the creator
              airdrop tool, or register a new event for a second round.
            </p>
          </section>

          <section id="proofs">
            <h2 className="font-display text-xl font-semibold">Generating allowlist proofs</h2>
            <p>
              On the Manage page for your POAP, paste your recipient addresses (one per line, or
              comma-separated) into the Allowlist tool and click "Build allowlist." Everything happens
              in your browser — addresses are de-duplicated and checksummed, a Merkle tree is built
              locally, and you get a preview of the resulting root plus a downloadable{" "}
              <code>proofs.json</code> mapping every address to its own proof. Only when you're satisfied
              do you click "Set allowlist root," which is the one irreversible onchain step.
            </p>
            <p>
              Distribute <code>proofs.json</code> to recipients however suits your event — email, a
              shared sheet, or a simple lookup page — so each person can find their own entry and paste
              their proof into the mint page's allowlist box.
            </p>
            <p>
              Prefer scripting it? <code>scripts/generate-allowlist.mjs</code> in this repo does the same
              thing from the command line against a CSV of addresses, useful for automating distribution
              outside the browser.
            </p>
          </section>

          <section id="signature">
            <h2 className="font-display text-xl font-semibold">Signature minting</h2>
            <p>
              A signature mint lets you authorize minting for a wallet you didn't know about in advance
              — no pre-built list required. You sign a message committing to
              (eventId, chainId, recipient address) with your creator wallet; the recipient submits that
              signature alongside their own mint call, and the contract recovers the signer and checks
              it matches you.
            </p>
            <p>
              This is available for 37 days after registration — the same 30-day creator window plus a
              7-day grace period, specifically so signatures you handed out near the deadline don't
              become worthless the moment the window closes.
            </p>
          </section>

          <section id="qr">
            <h2 className="font-display text-xl font-semibold">QR-code distribution</h2>
            <p>
              The Manage page's signature tool generates a QR code for every signature you create. Each
              QR encodes a link of the form <code>/event/[id]?sig=0x...&for=0xRecipient</code>; opening
              it takes the attendee straight to the mint page with that signature ready to submit. Print
              the QR on a poster, badge, or slide at your event — each code only works for the one wallet
              it was generated for, so there's no risk of someone else scanning a stranger's badge and
              minting in their place.
            </p>
          </section>

          <section id="permissions">
            <h2 className="font-display text-xl font-semibold">Creator permissions</h2>
            <p>
              Only the address that registered an event can: open or close public minting, set the
              allowlist root, generate valid signatures for it, and directly airdrop it to a list. There
              is no admin override and no way to transfer creator status — it's fixed to the registering
              address for the life of the event.
            </p>
          </section>

          <section id="deadlines">
            <h2 className="font-display text-xl font-semibold">Minting deadlines</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li><strong>0–30 days after registration:</strong> creator can toggle public minting, set the allowlist root (once), and directly airdrop via creator mint.</li>
              <li><strong>0–37 days after registration:</strong> signature mints remain valid (30 days + 7-day grace).</li>
              <li><strong>After 30 days:</strong> public-mint status and allowlist root are frozen wherever they were left; whatever was open stays open, whatever was closed stays closed.</li>
              <li><strong>Public and allowlist minting themselves have no expiry</strong> — if public minting is open, it stays mintable indefinitely unless the creator closes it before the 30-day mark.</li>
            </ul>
          </section>

          <section id="restrictions">
            <h2 className="font-display text-xl font-semibold">Contract restrictions</h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Max 1 POAP per wallet per event, enforced across every minting method.</li>
              <li>Name: 1–128 characters. Description: ≤512. Location and external URL: ≤128 each.</li>
              <li>Creator batch mint: max 101 recipients per transaction.</li>
              <li>Soulbound tokens cannot be transferred once minted — only burned.</li>
              <li>The contract itself is never modified by this frontend; every action here is a direct call to the deployed contract's existing interface.</li>
            </ul>
          </section>

          <section id="verify">
            <h2 className="font-display text-xl font-semibold">Verifying a minted POAP</h2>
            <p>
              After minting, the app links you straight to your transaction on{" "}
              <a className="text-accent2 underline" href="https://sepolia.basescan.org" target="_blank" rel="noreferrer">BaseScan</a>{" "}
              and to the token on{" "}
              <a className="text-accent2 underline" href="https://testnets.opensea.io" target="_blank" rel="noreferrer">OpenSea</a>.
              You can also independently verify ownership by calling <code>balanceOf(yourAddress, eventId)</code>{" "}
              on the contract directly — which is exactly what this app's Gallery page does, live, every
              time you load it.
            </p>
            <p className="mt-3">
              For a more shareable receipt than a bare transaction link, see the Boarding Pass below.
            </p>
          </section>

          <section id="passport">
            <h2 className="font-display text-xl font-semibold">The Passport</h2>
            <p>
              Everything below this point is built on top of the required functionality — none of it is
              asked for by the bounty, and all of it reads and writes the same live contract as everything
              else in this app. The Gallery page satisfies the "view what I own" requirement on its own;
              the Passport (<code>/passport</code>) is a second, more considered way to look at the same
              data.
            </p>
            <p className="mt-3">
              It opens on a closed cover — your stamp count, a "tap to open" cue — and tapping it plays an
              actual 3D page-turn (CSS <code>perspective</code> + <code>rotateY</code>, not a fade) that
              swings the cover away before the first spread appears underneath. Two POAPs are laid out per
              page, oldest first, the way a real passport reads front to back rather than newest-first like
              most feeds default to. Previous/Next page buttons turn with that same flip, and every spread
              has an "Export this page" button that draws that exact two-up layout to a canvas and downloads
              it as a PNG — no server, no screenshot tool, just <code>CanvasRenderingContext2D</code> drawing
              the same data already on the page.
            </p>
          </section>

          <section id="boarding-pass">
            <h2 className="font-display text-xl font-semibold">The Boarding Pass</h2>
            <p>
              Right after a mint confirms — and again any time you revisit an event you already hold — the
              app renders a ticket-stub card instead of a plain "transaction confirmed" message: the
              artwork, the event, your address as "Passenger," the chain as "Gate," and a perforated edge
              separating the main stub from a scannable <strong>QR code that encodes a real link to the
              token's OpenSea page</strong>.
            </p>
            <p className="mt-3">
              That QR code is the actual point of the feature, not decoration on top of it. A screenshot
              with a caption claiming "I minted this" is easy to fake; a QR code that resolves to the real
              token isn't. Anyone who receives the downloaded image — on Farcaster, on X, in a group chat —
              can scan it and land directly on verified onchain proof without this app being open, without
              trusting a caption, without needing any context at all. "Download," "Share on Farcaster," and
              "Share on X" all work off the same rendered card, and direct OpenSea/BaseScan links sit
              alongside the QR for anyone who'd rather click than scan.
            </p>
          </section>

          <section id="travelers">
            <h2 className="font-display text-xl font-semibold">Fellow Travelers</h2>
            <p>
              A POAP doesn't just prove you were somewhere — it proves other specific people were there
              too, and nothing in a standard gallery surfaces that. Fellow Travelers (<code>/travelers</code>)
              does: it reads every event your connected wallet holds via batched <code>hasClaimed</code>{" "}
              calls, then walks the onchain <code>NewMint</code> log history for exactly those events —
              and only those events, so the expensive part of the query stays small no matter how large the
              contract's total history grows — to find every other address that minted the same things you
              did.
            </p>
            <p className="mt-3">
              The result renders as a constellation: you at the center, everyone you've overlapped with
              orbiting around you, sized by how many events you actually share. Results stream in live as
              each event's log history resolves, rather than leaving you staring at a blank spinner until
              the slowest one finishes. Click anyone in the constellation to see exactly which events you
              have in common with them.
            </p>
          </section>

          <section id="palette">
            <h2 className="font-display text-xl font-semibold">Generative-ink palettes</h2>
            <p>
              Registering a POAP with your own hand-designed SVG is fully supported and remains the
              recommended path for a real event's branding. But for anyone without the time or the design
              tool open, the in-app Stamp Designer can generate artwork instead — and its palette isn't
              picked from a handful of preset swatches, it's derived deterministically from the event's own
              name. A fast hash of the title produces a hue, a light-or-dark base, and an accent color named
              in the language of actual ink and wax — "Oxblood," "Verdigris," "Twilight Indigo" — rather
              than a generic "orange" or "blue." Hit "Shuffle for another take" for a different valid option
              off the same name; the same title always finds its way back to the same default ink.
            </p>
            <p className="mt-3">
              The generator doesn't stop at "looks fine," either: it measures the real WCAG contrast ratio
              between the generated accent and background and walks the accent's lightness toward the
              background until it clears a 4.0 floor. That check exists because it caught a real problem —
              roughly a third of naively hash-generated combinations tested as low as 2.25 contrast,
              legible in theory and genuinely hard to read in practice. Every generated stamp on this app
              has been through that check; none of them are just hoped to be readable.
            </p>
          </section>
        </article>
      </div>
      <Footer />
    </main>
  );
}
