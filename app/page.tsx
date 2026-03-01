"use client";
// Home page - shows project architecture and logic

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              Matchbook
            </span>
            <span className="text-gray-300"> Escrow System</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8">
            A decentralized trading platform built on Solana using smart
            contracts to enable secure, trustless peer-to-peer token swaps with
            automatic refunds.
          </p>
          {!connected && (
            <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 max-w-xl mx-auto">
              <p className="text-purple-200">
                🔐 Connect your wallet to start trading
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="px-4 py-16 bg-black/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            System Architecture
          </h2>

          {/* Architecture Diagram */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
            {/* User Accounts */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                User Accounts
              </h3>
              <p className="text-gray-300 text-sm">
                Each user has a unique PDA (Program Derived Address) that
                tracks:
              </p>
              <ul className="text-gray-400 text-sm space-y-1 mt-3">
                <li>• Escrow seed counter</li>
                <li>• Transaction history</li>
                <li>• Account authority</li>
              </ul>
            </div>

            {/* Escrow Contracts */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Escrow Contracts
              </h3>
              <p className="text-gray-300 text-sm">
                Each escrow is a smart contract holding:
              </p>
              <ul className="text-gray-400 text-sm space-y-1 mt-3">
                <li>• Maker's tokens (locked)</li>
                <li>• Target amount requirements</li>
                <li>• Expiration deadline</li>
                <li>• Unique seed for PDA</li>
              </ul>
            </div>

            {/* Token Vaults */}
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-4xl mb-4">🏦</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Token Vaults
              </h3>
              <p className="text-gray-300 text-sm">
                Associated token accounts (ATAs) owned by escrow PDAs:
              </p>
              <ul className="text-gray-400 text-sm space-y-1 mt-3">
                <li>• Hold deposited tokens securely</li>
                <li>• Only program can withdraw</li>
                <li>• Controlled by escrow PDA</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">
            How Escrow Works
          </h2>

          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Create User Account
                </h3>
                <p className="text-gray-300 mb-4">
                  Before creating escrows, initialize your user account on the
                  blockchain. This stores your escrow seed counter and ensures
                  unique PDAs.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    Program: create_user()
                    <br />
                    Seeds: ["user", maker_pubkey]
                    <br />
                    Cost: ~0.001 SOL
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Create Escrow Offer
                </h3>
                <p className="text-gray-300 mb-4">
                  Lock your tokens in an escrow contract with custom terms.
                  Specify which tokens you're offering and what you want in
                  return.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    Program: create_escrow()
                    <br />
                    Seeds: ["es", maker_pubkey, seed]
                    <br />
                    Locks: Token A amount in Vault
                    <br />
                    Cost: ~0.002 SOL
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Deal with Escrow
                </h3>
                <p className="text-gray-300 mb-4">
                  Anyone can fulfill your escrow by providing the target tokens.
                  They'll receive your locked tokens, and you'll get theirs.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    Program: deal_token()
                    <br />
                    Transfers: Token B from taker to maker
                    <br />
                    Releases: Token A from vault to taker
                    <br />
                    Cost: ~0.003 SOL
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30 mb-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-3">
                  Refund (Optional)
                </h3>
                <p className="text-gray-300 mb-4">
                  If your escrow expires unfulfilled, automatically refund your
                  tokens. Only you (the maker) can initiate this.
                </p>
                <div className="bg-black/30 rounded-lg p-4">
                  <code className="text-green-400 text-sm">
                    Program: refund()
                    <br />
                    Returns: Token A from vault to maker
                    <br />
                    Condition: deadline &lt; current_time
                    <br />
                    Cost: ~0.0015 SOL
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Contract Instructions */}

      {/* Transaction Flow */}

      {/* Key Features */}

      {/* Call to Action */}

      {/* Footer */}
      <footer className="bg-black/40 border-t border-gray-700 py-8 mt-16">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="text-2xl">◎</div>
            <span className="text-gray-400 font-semibold">Solana</span>
            <span className="text-gray-500">+</span>
            <span className="text-purple-400 font-semibold">Anchor</span>
          </div>
          <p className="text-gray-500 mb-2">
            Built on Solana with Anchor Framework
          </p>
          <p className="text-gray-600 text-sm">
            © 2026 Matchbook. Decentralized Escrow Trading.
          </p>
        </div>
      </footer>
    </div>
  );
}
