import Link from 'next/link';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16 text-center">
        {/* 404 Number */}
        <div className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-4">
          404
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Navigation Options */}
        <div className="flex justify-center space-x-4 mb-12">
          <Link
            href="/"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-8 py-3 rounded-lg transition-all"
          >
            Go Home
          </Link>
          <Link
            href="/escrows"
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
          >
            View Escrows
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 max-w-lg mx-auto">
          <h2 className="text-lg font-semibold text-white mb-4">Looking for something?</h2>
          <div className="space-y-3">
            <Link
              href="/"
              className="block text-gray-300 hover:text-white transition-colors"
            >
              🏠 Home Page - Learn about Matchbook
            </Link>
            <Link
              href="/create"
              className="block text-gray-300 hover:text-white transition-colors"
            >
              ➕ Create Offer - Create a new escrow
            </Link>
            <Link
              href="/escrows"
              className="block text-gray-300 hover:text-white transition-colors"
            >
              📋 View Offers - Browse available escrows
            </Link>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-gray-400">
          <p>Need help? Check that you have the correct URL or navigate back using the links above.</p>
        </div>
      </div>
    </div>
  );
}
