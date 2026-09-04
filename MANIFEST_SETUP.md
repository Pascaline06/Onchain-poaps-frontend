# Setting up the real farcaster.json (do this before posting the cast)

`public/.well-known/farcaster.json` in this repo is a *template*. Every URL in
it currently points at `onchain-poaps.example.com` — replace every one of
those with your actual deployed domain once Vercel gives you it, including
`homeUrl`, `iconUrl`, `imageUrl`, `splashImageUrl`, and `webhookUrl`.

The `accountAssociation` block proves *you* (your Farcaster custody address)
own this domain. You cannot fabricate this — it has to be signed by your
Farcaster account. The straightforward path:

1. Deploy the app to Vercel first, so you have a real domain.
2. Go to the Farcaster developer tools (Warpcast Settings → Developer →
   Domains, or use `@farcaster/miniapp-node`'s manifest signing helper) and
   generate the account association for your domain.
3. Paste the resulting `header` / `payload` / `signature` values into
   `farcaster.json` in place of the `REPLACE_WITH_...` placeholders.
4. Redeploy. Fetch `https://yourdomain.com/.well-known/farcaster.json`
   yourself afterward and confirm it returns valid JSON with your real
   values, not the template.

Only after that is done will Warpcast recognize the Mini App and render an
interactive embed instead of a plain link when you post the cast.

Note: there's no `webhookUrl` in this manifest. That field is for Farcaster
to deliver notification tokens when someone adds the Mini App or enables
notifications — this app doesn't send any notifications yet, so pointing it
at a route that doesn't exist would just be a dangling reference. Add it
back (and build the `/api/webhook` route to receive and verify the signed
event payload) if you want to add push notifications later, e.g. reminding
a creator when their 30-day allowlist/public-mint window is about to close.
