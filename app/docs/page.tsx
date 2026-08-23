import { Nav } from "@/components/Nav";

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
            <h1 className="font-display text-3xl font-bold">Docs</h1>
            <p className="text-ink/60">
              Everything below describes the actual OnchainPOAPs contract — every rule, limit, and
              deadline here matches <code>Poap.sol</code> exactly, not just this frontend.
            </p>
          </div>

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
          </section>
        </article>
      </div>
    </main>
  );
}
