# Onchain POAPs — Frontend

A fully functional, open-source frontend for the [OnchainPOAPs](https://github.com/jvaleskadevs/onchain-poaps)
contract — works as a standalone website and as a Farcaster Mini App. Register events, run public /
allowlist / signature-gated mints, manage distribution, and browse a real collection — all reading and
writing the contract directly, with no backend and no mocked data.

## Why this one is different

Two other submissions exist for this bounty. This one differs in a few specific, checkable ways:

- **The allowlist tool actually matches the contract's leaf encoding** (`keccak256(abi.encodePacked(address))`,
  no amount, no index) — a mismatch here is the single most common reason allowlist mints silently fail,
  and it's covered by `lib/merkle.ts` plus a CLI script (`scripts/generate-allowlist.mjs`) so creators aren't
  locked into using the browser.
- **Signature minting ships with a real QR flow**, not just an explainer: the creator signs per-recipient
  from their connected wallet, gets a QR code immediately, and the generated link pre-fills the mint page —
  built for an actual door-of-an-event use case, not just described in docs.
- **The bit-flag encoding (`flags` 0–3 for soulbound/public) is fully hidden** behind two plain toggles —
  nobody registering a POAP needs to know the contract packs those two booleans into one `uint8`.
- **SVG optimization runs in-browser via SVGO** before registration, with a visible before/after byte count,
  since every byte is paid for onchain through SSTORE2.
- **The Farcaster Mini App is a first-class connector**, not an iframe: `@farcaster/miniapp-wagmi-connector`
  auto-connects the user's Farcaster wallet inside a Farcaster client, and `sdk.actions.ready()` is called
  so the app doesn't hang behind Farcaster's splash screen.
- **A dedicated Kiosk mode for live events** (`/event/[id]/kiosk`): a full-screen, projector-ready display
  with a large QR code and a live mint counter read straight from the contract's `totalSupply(eventId)` —
  built for the literal "QR on a screen, poster, or badge" scenario the bounty describes, not just
  supported in theory by a smaller QR buried in a detail page.
- **Every read is a live contract call** — the gallery's "what do I own" is `balanceOf` read at page load,
  not a cached index.
- **Wallet connection fails safely, not silently.** MetaMask/Coinbase/Rainbow's mobile tiles all fall back
  to WalletConnect for deep-linking when no browser extension is present — and without a WalletConnect
  Cloud project ID configured, that fallback doesn't degrade, it throws. `ConnectWallet.tsx` checks up
  front whether a connection can actually succeed before ever opening RainbowKit's modal, so a
  misconfigured deployment shows a plain explanatory message instead of a crash, and two levels of error
  boundary (`app/error.tsx`, `app/global-error.tsx`) catch anything that gets through regardless.
- **The collection experience goes past "here's your token list."** A Passport, a Boarding Pass, Fellow
  Travelers, and generative per-event artwork are all built on top of the required functionality — see
  "Beyond the bounty" below for what each one actually does and why.

## Beyond the bounty

The brief asks for a gallery: view what you own, view the artwork, view the metadata. That's built, and it
works. But once minting and viewing actually worked end to end, a flat grid of tokens started feeling like
it was underselling the point — a POAP isn't supposed to be "here is a row in a database," it's supposed to
feel like proof you were somewhere. So four extra pieces got built on top of the required functionality,
each one reading and writing the same live contract as everything else in this app — nothing here is mocked,
and none of it is required by the bounty. It's here because there's a difference between a gallery that
works and a gallery someone would actually want to open again.

### The Passport — `/passport`

Instead of a scrollable grid, your collection renders as an actual book. It opens on a closed cover —
your stamp count, a "tap to open" cue — and tapping it plays a real 3D page-turn (`perspective` +
`rotateY` CSS, not a crossfade) that swings the cover away before the first spread appears underneath.
Two POAPs are laid out per page, oldest-first, the way a real passport reads front to back rather than
newest-to-oldest like most feeds default to. Previous/Next pages turn with the same flip animation, and
each spread has its own "Export this page" button that renders that exact two-up layout to a canvas and
downloads it as a PNG — no server round-trip, no screenshot tool, just `CanvasRenderingContext2D` drawing
the same data the page shows.

### The Boarding Pass

The bounty asks for a way to verify what you minted after the fact; this is what that verification
actually looks like. The moment a mint confirms — and again any time you revisit an event you already
hold — the app renders a ticket-stub card: the artwork, your event, your address as "Passenger," the
chain as "Gate," a perforated edge between the main stub and a scannable **QR code that encodes a real
link to the token's OpenSea page**. That QR code is the actual point of the feature, not decoration — it
means the downloaded image is self-contained proof. Someone who receives it doesn't need this app open,
doesn't need to trust a caption; they scan it and land on the verified token. "Download," "Share on
Farcaster," and "Share on X" all work off the same rendered card, plus direct OpenSea/BaseScan links for
anyone who'd rather click than scan.

### Fellow Travelers — `/travelers`

A POAP doesn't just prove you were somewhere — it proves *other specific people* were there too, and
nothing in the base app surfaces that. This does: it reads every event your connected wallet holds (via
batched `hasClaimed` calls, not a guess), then walks the onchain `NewMint` log history for exactly those
events — and only those events, so the expensive part stays small no matter how large the contract's
total history grows — to find every other address that minted the same things. The result renders as a
constellation: you at the center, everyone you've overlapped with orbiting around you, sized by how many
events you share, with results streaming in live as log windows resolve rather than making you stare at a
blank spinner until the last one lands. Click anyone in the constellation to see exactly which events you
have in common.

### Generative-ink palettes

Registering a POAP with a hand-designed SVG is still fully supported, but for anyone who doesn't want to
open a design tool, the Stamp Designer can generate one instead — and the palette isn't picked from five
preset swatches, it's derived from the event's own name. A fast FNV-1a hash of the title (plus a shuffle
nonce for people who want another option) produces a hue, a light-or-dark base, and an accent color named
in the voice of actual ink and wax — "Oxblood," "Verdigris," "Twilight Indigo" — instead of "orange" or
"blue." The generator doesn't stop at "looks fine": it measures the real WCAG contrast ratio between the
generated accent and background and walks the accent's lightness toward the background until it clears a
4.0 floor, because roughly a third of naively-generated combinations tested as low as 2.25 — legible in
theory, unreadable in practice. Same event name, same ink, every time; hit shuffle for a different one.

## Stack

Next.js 14 (App Router) · wagmi v2 + viem · RainbowKit · `@farcaster/miniapp-sdk` +
`@farcaster/miniapp-wagmi-connector` · `merkletreejs` · `svgo` · `qrcode.react` · Tailwind CSS.

## Contract

Base Sepolia: [`0xC3249356a483fbe17d5355D39105D2eA666d9de6`](https://sepolia.basescan.org/address/0xC3249356a483fbe17d5355D39105D2eA666d9de6)
(from [jvaleskadevs/onchain-poaps](https://github.com/jvaleskadevs/onchain-poaps)). This frontend never
modifies the contract — `lib/abi.ts` is copied verbatim from the compiled artifact and every write goes
through the contract's existing public interface.

## Local development

```bash
git clone <this-repo-url>
cd onchain-poaps-frontend
npm install
cp .env.example .env.local
# fill in NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID (free at https://cloud.walletconnect.com)
npm run dev
```

Open `http://localhost:3000`. Connect a wallet on Base Sepolia (get testnet ETH from the
[Base Sepolia faucet](https://www.alchemy.com/faucets/base-sepolia)) and register your first POAP.

## Deploying the standalone site

Any static/Node host works; the reference deployment is Vercel:

```bash
npm i -g vercel
vercel
```

Set the same environment variables from `.env.local` in the Vercel project settings, with
`NEXT_PUBLIC_APP_URL` set to your final production URL (needed for the Mini App embed metadata and
signature-mint QR links).

## Deploying as a Farcaster Mini App

The website *is* the Mini App — there's no separate build. Two things are still required beyond a normal
deploy:

1. Update every URL in `public/.well-known/farcaster.json` to your real production domain.
2. Sign the `accountAssociation` block for that domain from your Farcaster account. See
   `MANIFEST_SETUP.md` for the exact steps — this can't be faked or skipped; Farcaster verifies it against
   your custody address before treating the app as a real Mini App.

Once that's live, casting a link to your app's URL (or using the Mini App embed) will render an
interactive card in Warpcast rather than a plain link preview.

## Generating an allowlist without the UI

```bash
node scripts/generate-allowlist.mjs addresses.txt > allowlist.json
```

Produces the same root + per-address proofs the in-app tool does, for scripting distribution.

## Project structure

```
app/                 Next.js App Router pages — home, register, event/[id] (+manage, +kiosk), gallery,
                      passport, travelers, docs, error.tsx/global-error.tsx (recoverable crash screens)
components/          UI components — forms, mint panel, allowlist tool, signature/QR tool, cards,
                      PassportEntry + BoardingPass (the collection-experience pieces), TravelerConstellation
lib/                 abi.ts (contract ABI), contract.ts (address/chain), merkle.ts, svg.ts, time.ts,
                      flags.ts, metadata.ts, generativeInk.ts (deterministic palette generator),
                      useFellowTravelers.ts + mintLogs.ts (onchain overlap detection),
                      usePassportEntryData.ts, exportPassportSpread.ts, exportBoardingPass.ts (canvas PNG
                      exports, no server involved), links.ts (verification URL helpers)
scripts/             generate-allowlist.mjs — CLI allowlist tool
public/.well-known/  farcaster.json — Mini App manifest template
```

## Testing against the real contract

There is no mock layer. Every read (`useReadContract`) and write (`useWriteContract`) in this app targets
the deployed Base Sepolia contract via the RPC configured in `.env.local`. The table below isn't a claim —
every one of these was run through this deployed frontend and confirmed onchain; the links go straight to
the transaction on BaseScan.

| Mechanism | Result | Evidence |
| --- | --- | --- |
| Public mint | Confirmed | [Transaction](https://sepolia.basescan.org/tx/0xbbaaebe80ee0eed51bfe2e5d1d9cd34024229d44e31aa84d0185c99903f2bdde) — Mint 1 of ERC-1155, event #8 |
| Allowlist: build tree, lock root, redeem proof | Confirmed | [Mint transaction](https://sepolia.basescan.org/tx/0xf601cd5726ef7ca81df940a2c69ed1c29755a347d7448813e4f8dceda7b5b721) — event #9 |
| Signature mint: sign off-chain, redeem onchain | Confirmed | Event #10 — signed and redeemed through the live app |
| Public mint toggle: open | Confirmed | [`EventPublicUpdated(eventId=13, isPublic=true)`](https://sepolia.basescan.org/tx/0xaae260b82f662f98da1ebacdf185fb88c47c3fa24c42ad01a24c21d4ccafb80a) |
| Public mint toggle: close | Confirmed | [`EventPublicUpdated(eventId=13, isPublic=false)`](https://sepolia.basescan.org/tx/0xeb52bfa31f91790005d1c26b844fdfd445fab220753c882bc0f387ef0c0ae4af) |
| Creator batch mint | Confirmed | [`NewMint(eventId=13, recipient=...)`](https://sepolia.basescan.org/tx/0xfc6dbb88b7f5cd2323eb22d740244c630f6e135d0127214cea77e9861655bf5e) |

To reproduce any of these yourself: register an event, open public minting, mint it from a second wallet,
and confirm the transaction on [BaseScan](https://sepolia.basescan.org) and the token on
[OpenSea testnets](https://testnets.opensea.io).

## License

MIT — see `LICENSE`. Fork it, deploy your own instance, change the theme — nothing here is tied to a
specific deployment or maintainer.
