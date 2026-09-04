# Onchain POAPs — Final Competition Upgrade

This build deliberately preserves the supplied contract integration and the existing event artwork pipeline. Event artwork is still read from each POAP's onchain token URI; no event images were replaced.

## Added / upgraded
- Black/orange reference-inspired visual system with large, heavy, highly legible typography
- Dark mode as the default presentation plus persistent light mode
- Mobile navigation suitable for the Farcaster Mini App
- Onchain Journey Orbit (the visual “wow” feature)
- Full Event/Traveler Passport with collection stats and exportable spreads
- Traveler Network / fellow-traveler experience
- Organizer reputation/activity score derived from onchain events + claims
- Organizer Command Center with direct Manage / QR Kiosk / View actions
- New event discovery route
- Enhanced event detail + verification experience
- Dark, downloadable shareable POAP Proof card with QR verification
- Optional bytes32 allowlist root at registration, so the registration UI now exposes every registerEvent parameter while preserving the guided post-registration allowlist workflow

## Regression fixes completed during final review
- Restored signature-QR deep-link prefill on `/event/[id]?sig=...`
- Restored creator/signature countdowns on event detail pages
- Preserved the existing creator Manage and Kiosk routes
- Corrected organizer reputation on event pages to use the organizer's portfolio claims rather than only the current event
- Added direct organizer dashboard controls instead of routing every organizer action through the public event page
- Added mobile navigation so core routes remain usable inside compact Mini App viewports

## Contract compatibility checked
The frontend remains aligned with the supplied Poap.sol interface: `registerEvent`, `mint`, `allowlistMint`, `mintWithSignature`, `creatorMint`, `updateAllowlistRoot`, and `updateEventPublic`. The smart contract itself is unchanged.

## Run before deployment
```bash
npm install
npm run build
```

Then deploy to Vercel as before and verify your production `NEXT_PUBLIC_APP_URL`, WalletConnect project ID, and Farcaster manifest/account association.
