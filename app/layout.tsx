import type { Metadata } from "next";
import Header from "@/components/Header";
import WalletProviders from "@/components/WalletProviders";
import "../globals.css";

// Default styles that can be overridden by your app

export const metadata: Metadata = {
  title: "Matchbook - Escrow Trading Platform",
  description: "Create and fulfill escrow trades for USDC and USDT on Solana",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProviders>
          <div className="min-h-screen bg-linear-to-br from-gray-900 via-purple-900 to-gray-900">
            <Header />
            <main className="container mx-auto">{children}</main>
          </div>
        </WalletProviders>
      </body>
    </html>
  );
}
