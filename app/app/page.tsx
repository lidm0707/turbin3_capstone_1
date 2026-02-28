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
      <section className="px-4 py-16 bg-black/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Smart Contract Instructions
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* create_user */}
            <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 rounded-lg p-6 border border-purple-500/30">
              <h3 className="text-xl font-bold text-purple-300 mb-3">
                create_user
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Initialize a user account on the blockchain
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-purple-400">Accounts:</span>
                  <span className="text-gray-400">
                    {" "}
                    maker, user (PDA), system_program
                  </span>
                </div>
                <div>
                  <span className="text-purple-400">Seeds:</span>
                  <span className="text-gray-400"> ["user", maker_pubkey]</span>
                </div>
                <div>
                  <span className="text-purple-400">Security:</span>
                  <span className="text-gray-400">
                    {" "}
                    Only creates account if doesn't exist
                  </span>
                </div>
              </div>
            </div>

            {/* create_escrow */}
            <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 rounded-lg p-6 border border-blue-500/30">
              <h3 className="text-xl font-bold text-blue-300 mb-3">
                create_escrow
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Create a new escrow contract for token swap
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-blue-400">Accounts:</span>
                  <span className="text-gray-400">
                    {" "}
                    maker, user, escrow (PDA), tokenA, tokenB, makerAtaA,
                    associated_token_program, token_program, system_program
                  </span>
                </div>
                <div>
                  <span className="text-blue-400">Seeds:</span>
                  <span className="text-gray-400">
                    {" "}
                    ["es", maker_pubkey, seed (u64)]
                  </span>
                </div>
                <div>
                  <span className="text-blue-400">Logic:</span>
                  <span className="text-gray-400">
                    {" "}
                    Locks Token A, validates terms, sets deadline
                  </span>
                </div>
              </div>
            </div>

            {/* deal_token */}
            <div className="bg-gradient-to-br from-green-900/50 to-green-800/30 rounded-lg p-6 border border-green-500/30">
              <h3 className="text-xl font-bold text-green-300 mb-3">
                deal_token
              </h3>
              <p className="text-gray-300 text-sm mb-3">
                Fulfill an escrow by completing the trade
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-green-400">Accounts:</span>
                  <span className="text-gray-400">
                    {" "}
                    taker, escrow, maker, tokenA, makerAtaA, takerAtaA, tokenB,
                    takerAtaB, makerAtaB, vault, associated_token_program,
                    token_program
                  </span>
                </div>
                <div>
                  <span className="text-green-400">Logic:</span>
                  <span className="text-gray-400">
                    {" "}
                    Transfer Token B, release Token A, close escrow
                  </span>
                </div>
                <div>
                  <span className="text-green-400">Validation:</span>
                  <span className="text-gray-400">
                    {" "}
                    Ensures deadline hasn't expired
                  </span>
                </div>
              </div>
            </div>

            {/* refund */}
            <div className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 rounded-lg p-6 border border-orange-500/30">
              <h3 className="text-xl font-bold text-orange-300 mb-3">refund</h3>
              <p className="text-gray-300 text-sm mb-3">
                Return tokens after escrow expiration
              </p>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-orange-400">Accounts:</span>
                  <span className="text-gray-400">
                    {" "}
                    maker, escrow, tokenA, tokenAtaA, vault,
                    associated_token_program, token_program
                  </span>
                </div>
                <div>
                  <span className="text-orange-400">Logic:</span>
                  <span className="text-gray-400">
                    {" "}
                    Return Token A to maker, close escrow
                  </span>
                </div>
                <div>
                  <span className="text-orange-400">Security:</span>
                  <span className="text-gray-400">
                    {" "}
                    Only maker can call, validates deadline
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Flow */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Transaction Flow
          </h2>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              {/* Maker */}
              <div className="flex-1 text-center">
                <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="text-white font-semibold">Maker</div>
                <div className="text-gray-400 text-sm mt-1">Creates escrow</div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex flex-1 items-center justify-center">
                <div className="text-3xl text-purple-400">→</div>
              </div>

              {/* Taker */}
              <div className="flex-1 text-center">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👤</span>
                </div>
                <div className="text-white font-semibold">Taker</div>
                <div className="text-gray-400 text-sm mt-1">
                  Fulfills escrow
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <div className="text-purple-300 font-semibold">
                    Maker deposits Token A
                  </div>
                  <div className="text-gray-400 text-sm">
                    Tokens are locked in escrow's vault PDA
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <div className="text-green-300 font-semibold">
                    Taker provides Token B
                  </div>
                  <div className="text-gray-400 text-sm">
                    Tokens transferred to maker's ATA
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <div className="text-purple-300 font-semibold">
                    Vault releases Token A
                  </div>
                  <div className="text-gray-400 text-sm">
                    Tokens transferred to taker's ATA
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="px-4 py-16 bg-black/20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Key Features
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Smart Contract Security
              </h3>
              <p className="text-gray-300 text-sm">
                Funds locked in immutable smart contracts, released only when
                terms met
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">💱</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Any SPL Token
              </h3>
              <p className="text-gray-300 text-sm">
                Support for all Solana SPL tokens, not just USDC/USDT
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">🌐</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Multi-Network
              </h3>
              <p className="text-gray-300 text-sm">
                Switch between Mainnet, Devnet, and Localnet
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Smart Selection
              </h3>
              <p className="text-gray-300 text-sm">
                Manual address input or select from wallet tokens
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">⏰</div>
              <h3 className="text-lg font-bold text-white mb-2">Auto Refund</h3>
              <p className="text-gray-300 text-sm">
                Automatic token return if escrow expires unfulfilled
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
              <div className="text-3xl mb-3">🔄</div>
              <h3 className="text-lg font-bold text-white mb-2">
                Real-Time Data
              </h3>
              <p className="text-gray-300 text-sm">
                All escrows fetched directly from blockchain (no mock data)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="px-4 py-16">
        <div className="container mx-auto">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center max-w-4xl border border-purple-500/30">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Start Trading?
            </h2>
            <p className="text-purple-100 mb-8 text-lg">
              Create your first escrow offer or browse existing offers
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                href="/create"
                className="bg-white text-purple-600 font-bold px-10 py-4 rounded-xl hover:bg-gray-100 transition-all text-lg"
              >
                Create Offer
              </Link>
              <Link
                href="/escrows"
                className="bg-purple-800 text-white font-bold px-10 py-4 rounded-xl hover:bg-purple-900 transition-all border border-purple-400 text-lg"
              >
                View Offers
              </Link>
            </div>
          </div>
        </div>
      </section>

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
            © 2024 Matchbook. Decentralized Escrow Trading.
          </p>
        </div>
      </footer>
    </div>
  );
}
