# Farcaster Mini App — production publishing checklist

This repository is already wired as a Farcaster Mini App. The production domain is:

```text
onchain-poaps-frontend-mu.vercel.app
```

The manifest is served from:

```text
https://onchain-poaps-frontend-mu.vercel.app/.well-known/farcaster.json
```

## What is already implemented

- `@farcaster/miniapp-sdk`
- `@farcaster/miniapp-wagmi-connector`
- `sdk.actions.ready()` after the React app mounts
- runtime Mini App detection
- automatic Farcaster-wallet connection when launched inside Farcaster
- standard standalone wallet UX outside Farcaster
- `fc:miniapp` embed metadata
- `fc:frame` compatibility metadata
- a production manifest
- a signed `accountAssociation` for the current Vercel domain
- 1024×1024 RGB icon
- 200×200 splash image
- 3:2 feed embed image
- 1200×630 promotional/OG image

## Important: the signed association is domain-bound

The current `accountAssociation.payload` is signed for:

```text
onchain-poaps-frontend-mu.vercel.app
```

Do not change `homeUrl` to a new production domain without regenerating the account association in Farcaster Developer Tools. Farcaster verifies that the signed domain and the hosted domain match.

## Publish / validate

1. Deploy the latest `main` branch to Vercel.
2. Open the manifest URL above in a normal browser and confirm it returns JSON.
3. Open Farcaster Developer Tools → Mini Apps / Manifest.
4. Enter `onchain-poaps-frontend-mu.vercel.app` as the domain.
5. Validate the manifest and account association.
6. Open the Mini App preview.
7. Test:
   - app loads past the splash screen;
   - wallet connects through the Farcaster host;
   - Gallery/Events render;
   - an event can be opened;
   - a transaction prompt can be initiated;
   - Passport, Travelers, Organizer and Proof routes are usable on mobile.
8. Publish/register the Mini App from Developer Tools.
9. Copy the resulting Farcaster Mini App / universal link for the bounty claim.

## Bounty cast

The final cast must:

- embed the Mini App;
- include the standalone frontend link;
- include the GitHub repository link;
- tag `@jvaleska.eth`;
- tag `@kenny`.

Then save:

- the cast URL; and
- a screenshot of the published cast.

Both are required for the POIDH claim.

## If the domain changes later

Use Farcaster's Manifest Tool to generate a new signed `accountAssociation` for the new exact domain, update every production URL in `public/.well-known/farcaster.json`, redeploy, and revalidate before publishing.
