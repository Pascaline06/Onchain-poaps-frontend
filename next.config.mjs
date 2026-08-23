/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { webpack }) => {
    // wagmi's Base Account connector transitively pulls in Coinbase's CDP SDK,
    // which has optional dynamic imports of @x402/* payment packages we never
    // use (we don't accept x402 payments — only wallet connect + POAP mints).
    // Those packages aren't real deps of this project, so webpack can't
    // statically resolve them at build time. Ignore them rather than install
    // dead weight.
    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// })
    );
    return config;
  },
  async headers() {
    return [
      {
        // Farcaster miniapp manifest must be servable with the right content type
        // and without caching surprises while you're iterating on it.
        source: "/.well-known/farcaster.json",
        headers: [{ key: "Content-Type", value: "application/json" }],
      },
    ];
  },
};
export default nextConfig;
