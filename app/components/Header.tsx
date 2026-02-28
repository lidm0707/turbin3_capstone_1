"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { NetworkSelector } from "./WalletProviders";

export default function Header() {
  const pathname = usePathname();

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-lg transition-colors ${
      pathname === path
        ? "bg-purple-600 text-white"
        : "text-gray-300 hover:text-white hover:bg-gray-800"
    }`;

  return (
    <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Matchbook
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Link href="/" className={navLinkClass("/")}>
              Home
            </Link>
            <Link href="/create" className={navLinkClass("/create")}>
              Create Offer
            </Link>

            <Link href="/escrows" className={navLinkClass("/escrows")}>
              View Offers
            </Link>
          </nav>

          {/* Wallet Button */}
          <div className="flex items-center space-x-4">
            <NetworkSelector />
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-semibold !px-6 !py-2 !rounded-lg transition-colors" />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex justify-center pb-3 space-x-2">
          <Link href="/" className={navLinkClass("/")}>
            Home
          </Link>
          <Link href="/create" className={navLinkClass("/create")}>
            Create
          </Link>
          <Link href="/escrows" className={navLinkClass("/escrows")}>
            Offers
          </Link>
        </div>
      </div>
    </header>
  );
}
