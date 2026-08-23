import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";

export function Nav() {
  return (
    <nav className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
      <Link href="/" className="font-display text-lg font-bold text-accent">
        Onchain POAPs
      </Link>
      <div className="flex items-center gap-5 text-sm">
        <Link href="/register" className="hover:text-accent">Create</Link>
        <Link href="/gallery" className="hover:text-accent">Gallery</Link>
        <Link href="/docs" className="hover:text-accent">Docs</Link>
        <ConnectWallet />
      </div>
    </nav>
  );
}
