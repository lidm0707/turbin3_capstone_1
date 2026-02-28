"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function Home() {
  const { connected } = useWallet();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Matchbook Escrow Trading
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
          Secure, decentralized escrow trading for USDC and USDT on Solana.
          Create offers, set terms, and let others fulfill them. If no deal is
          made within your timeframe, get a full refund automatically.
        </p>
        {!connected && (
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-purple-200">
              Connect your wallet using the button in the header to start
              trading
            </p>
          </div>
        )}
      </section>

      {/* What is Matchbook Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          What is Matchbook?
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              🔒 Secure Escrow
            </h3>
            <p className="text-gray-300">
              Your funds are locked in a smart contract escrow. The other party
              receives your tokens only when they meet your exact requirements.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              💱 Flexible Trading
            </h3>
            <p className="text-gray-300">
              Trade USDC for USDT or vice versa. Set your own exchange rates and
              expiration times. You're in complete control.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              ⏰ Time Protection
            </h3>
            <p className="text-gray-300">
              Set a deadline for your offer. If no one fulfills it in time, your
              funds are automatically refunded to your wallet.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30">
            <h3 className="text-xl font-semibold text-white mb-4">
              🌐 Decentralized
            </h3>
            <p className="text-gray-300">
              Built on Solana for fast, low-cost transactions. No intermediaries
              or trusted third parties needed.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-white mb-8 text-center">
          How it Works
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Create an Offer
                </h3>
                <p className="text-gray-300">
                  Choose which token you want to trade (USDC or USDT), set the
                  amount, specify what you want in return, and set an expiration
                  time.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Others See Your Offer
                </h3>
                <p className="text-gray-300">
                  Your offer appears in the public escrow marketplace where
                  anyone can view and decide to fulfill it.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Deal or Refund
                </h3>
                <p className="text-gray-300">
                  If someone accepts before the deadline, both parties receive
                  their tokens. If time runs out, you get a full refund
                  automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="text-center mb-12">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-purple-100 mb-6 text-lg">
            Create your first escrow offer or browse existing offers to find
            great deals.
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4">
            <Link
              href="/create"
              className="bg-white text-purple-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Create Offer
            </Link>
            <Link
              href="/escrows"
              className="bg-purple-800 text-white font-semibold px-8 py-3 rounded-lg hover:bg-purple-900 transition-colors border border-purple-400"
            >
              View Offers
            </Link>
            <Link
              href="/swap"
              className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-green-700 hover:to-teal-700 transition-colors"
            >
              Swap Tokens
            </Link>
          </div>
        </div>
      </section>

      {/* Supported Tokens */}
      <section className="text-center mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Supported Tokens</h2>
        <div className="flex justify-center flex-wrap gap-4">
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg px-8 py-4">
            <div className="text-3xl mb-2">◎</div>
            <div className="text-white font-semibold">SOL</div>
            <div className="text-purple-300 text-sm">Solana</div>
          </div>
          <div className="bg-blue-900/50 border border-blue-500 rounded-lg px-8 py-4">
            <div className="text-3xl mb-2">💵</div>
            <div className="text-white font-semibold">USDC</div>
            <div className="text-blue-300 text-sm">USD Coin</div>
          </div>
          <div className="bg-green-900/50 border border-green-500 rounded-lg px-8 py-4">
            <div className="text-3xl mb-2">💲</div>
            <div className="text-white font-semibold">USDT</div>
            <div className="text-green-300 text-sm">Tether</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400 py-8 border-t border-gray-700">
        <p className="mb-2">Built on Solana with Anchor Framework</p>
        <p className="text-sm">
          © 2024 Matchbook. Decentralized Escrow Trading.
        </p>
      </footer>
    </div>
  );
}
