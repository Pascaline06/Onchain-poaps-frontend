import Link from "next/link";
import { ConnectWallet } from "./ConnectWallet";

export function Nav() {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-ink/10 bg-paper/85 px-6 py-4 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
        <span className="flex h-7 w-7 -rotate-6 items-center justify-center rounded-full border-2 border-accent text-[10px] font-bold text-accent">
          OP
        </span>
        <span>
          Onchain <span className="text-accent">POAPs</span>
        </span>
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link href="/register" className="text-ink/70 transition-colors hover:text-accent">Create</Link>
        <Link href="/gallery" className="text-ink/70 transition-colors hover:text-accent">Gallery</Link>
        <Link href="/passport" className="hidden text-ink/70 transition-colors hover:text-accent sm:inline">Passport</Link>
        <Link href="/travelers" className="text-ink/70 transition-colors hover:text-accent">Travelers</Link>
        <Link href="/docs" className="text-ink/70 transition-colors hover:text-accent">Docs</Link>
        <ConnectWallet />
      </div>
    </nav>
  );
}
