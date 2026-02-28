"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import Link from "next/link";
import idlJson from "../../../target/idl/capstone_1.json";

const idl = idlJson as any;

import {
  PROGRAM_ID,
  userExists,
  dealToken,
  deriveUserPda,
  deriveEscrowPda,
  deriveVaultAddress,
  toTokenAmount,
} from "../../lib/solana";

interface TokenMetadata {
  address: string;
  decimals: number;
  name?: string;
  symbol?: string;
}

interface EscrowData {
  pda: PublicKey;
  maker: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  depositTokenA: BN;
  targetB: BN;
  deadline: BN;
  seed: number;
  escrowCount: number;
}

interface OfferCardProps {
  offer: EscrowData;
  makerTokenMetadata: TokenMetadata | null;
  takerTokenMetadata: TokenMetadata | null;
  onFulfill: (offer: EscrowData) => void;
  isExpired: boolean;
}

export default function SwapPage() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [offers, setOffers] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [fulfilling, setFulfilling] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [tokenMetadata, setTokenMetadata] = useState<{
    [key: string]: TokenMetadata;
  }>({});

  useEffect(() => {
    setMounted(true);
    fetchOffers();
  }, [connection, publicKey]);

  // Fetch all escrow offers
  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all program accounts and try to decode them as escrows
      const provider = new AnchorProvider(
        connection,
        {
          publicKey: PublicKey.default,
          signTransaction: async () => {
            throw new Error("No signer");
          },
          signAllTransactions: async () => {
            throw new Error("No signer");
          },
        },
        { commitment: "confirmed" }
      );

      const program = new Program(idl, provider);
      const coder = program.coder;

      // Get all accounts owned by the program
      const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);

      const offers: EscrowData[] = [];

      for (const account of programAccounts) {
        try {
          // Try to decode as escrow account
          const decoded = coder.accounts.decode("escrow", account.account.data);

          const escrow: EscrowData = {
            pda: account.pubkey,
            maker: decoded.maker as PublicKey,
            tokenA: decoded.tokenA as PublicKey,
            tokenB: decoded.tokenB as PublicKey,
            depositTokenA: decoded.depositTokenA as BN,
            targetB: decoded.targetB as BN,
            deadline: decoded.deadline as BN,
            seed: decoded.seed as number,
            escrowCount: 0, // Not needed for display
          };
          offers.push(escrow);

          // Fetch metadata for both tokens if not already cached
          const tokenAKey = escrow.tokenA.toString();
          const tokenBKey = escrow.tokenB.toString();

          if (!tokenMetadata[tokenAKey]) {
            fetchTokenMetadata(tokenAKey).then((metadata) => {
              if (metadata) {
                setTokenMetadata((prev) => ({
                  ...prev,
                  [tokenAKey]: metadata,
                }));
              }
            });
          }

          if (!tokenMetadata[tokenBKey]) {
            fetchTokenMetadata(tokenBKey).then((metadata) => {
              if (metadata) {
                setTokenMetadata((prev) => ({
                  ...prev,
                  [tokenBKey]: metadata,
                }));
              }
            });
          }
        } catch (err) {
          // This account is not an escrow account, skip it
          // (could be a user account or other program account)
        }
      }

      setOffers(offers);
    } catch (err) {
      console.error("Error fetching offers:", err);
      setError("Failed to fetch available offers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch token metadata for an address
  const fetchTokenMetadata = async (
    address: string | PublicKey
  ): Promise<TokenMetadata | null> => {
    try {
      const publicKey =
        typeof address === "string" ? new PublicKey(address) : address;
      const mintInfo = await getMint(connection, publicKey);
      const addressStr = publicKey.toString();

      return {
        address: addressStr,
        decimals: mintInfo.decimals,
        name: addressStr.slice(0, 8) + "...",
        symbol: addressStr.slice(0, 4),
      };
    } catch (err) {
      console.error("Error fetching token metadata:", err);
      return null;
    }
  };

  // Calculate time remaining
  const getTimeRemaining = (
    deadline: BN
  ): { expired: boolean; display: string } => {
    const now = Math.floor(Date.now() / 1000);
    const deadlineSeconds = deadline.toNumber();
    const diff = deadlineSeconds - now;

    if (diff <= 0) {
      return { expired: true, display: "Expired" };
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let display = "";
    if (hours > 0) display += `${hours}h `;
    if (minutes > 0) display += `${minutes}m `;
    display += `${seconds}s`;
    display += " remaining";

    return { expired: false, display };
  };

  // Fulfill an escrow offer
  const handleFulfillOffer = async (offer: EscrowData) => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet");
      return;
    }

    setFulfilling(offer.pda.toString());
    setError("");
    setSuccess("");

    try {
      // Create Anchor provider
      const provider = new AnchorProvider(
        connection,
        {
          publicKey,
          signTransaction: async (tx) => {
            if (!signTransaction) {
              throw new Error("Wallet does not support signing");
            }
            return await signTransaction(tx);
          },
          signAllTransactions: async (txs) => {
            if (!signTransaction) {
              throw new Error("Wallet does not support signing");
            }
            return await Promise.all(txs.map(signTransaction));
          },
        },
        { commitment: "confirmed" }
      );

      // Load the program
      const program = new Program(idl, provider);

      // Check if user exists, create if not
      const userAccountExists = await userExists(provider, publicKey, program);
      if (!userAccountExists) {
        throw new Error("Please create a user account first");
      }

      // Derive necessary addresses
      const [userPda] = deriveUserPda(publicKey);
      const makerPda = deriveUserPda(offer.maker);
      const makerAtaA = await getAssociatedTokenAddress(
        offer.tokenA,
        offer.maker
      );
      const takerAtaA = await getAssociatedTokenAddress(
        offer.tokenA,
        publicKey
      );
      const takerAtaB = await getAssociatedTokenAddress(
        offer.tokenB,
        publicKey
      );
      const makerAtaB = await getAssociatedTokenAddress(
        offer.tokenB,
        offer.maker
      );
      const vault = await deriveVaultAddress(offer.pda, offer.tokenA);

      // Fulfill the escrow
      const tx = await dealToken(
        provider,
        publicKey,
        program,
        offer.pda,
        offer.maker,
        offer.tokenA,
        makerAtaA,
        takerAtaA,
        offer.tokenB,
        takerAtaB,
        makerAtaB,
        offer.targetB.toNumber()
      );

      setSuccess(
        "Offer fulfilled successfully! Check your wallet for the tokens."
      );

      // Refresh offers
      await fetchOffers();
    } catch (err) {
      console.error("Error fulfilling offer:", err);
      setError(
        `Failed to fulfill offer: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setFulfilling(null);
    }
  };

  // Truncate address for display
  const truncateAddress = (
    address: string | PublicKey,
    chars: number = 8
  ): string => {
    const addrStr = typeof address === "string" ? address : address.toString();
    return addrStr.slice(0, chars) + "..." + addrStr.slice(-chars);
  };

  // Format token amount
  const formatTokenAmount = (amount: BN, decimals: number): string => {
    const divisor = 10 ** decimals;
    const whole = amount.div(new BN(divisor)).toString();
    const fraction = amount
      .mod(new BN(divisor))
      .toString()
      .padStart(decimals, "0")
      .slice(0, 6);
    return `${whole}.${fraction}`;
  };

  // Prevent SSR issues
  if (!mounted) {
    return null;
  }

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Swap Tokens
        </h1>

        {!connected ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <p className="text-gray-300 text-lg mb-6">
              Connect your wallet to swap tokens
            </p>
            <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-semibold !px-8 !py-3 !rounded-lg !text-lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Info Box */}
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <div className="flex items-start space-x-3">
                <div className="text-2xl">ℹ️</div>
                <div className="text-gray-300 text-sm">
                  <div className="font-semibold text-white mb-1">
                    How to swap:
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Find an escrow offer below</li>
                    <li>Make sure you have the required target tokens</li>
                    <li>Click "Fulfill Offer" to complete the swap</li>
                    <li>Your tokens will be transferred automatically</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-green-200">
                {success}
              </div>
            )}

            {/* Offers Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-300">Loading available offers...</p>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-300 text-lg mb-4">
                  No offers available at the moment
                </p>
                <Link
                  href="/create"
                  className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Create an Offer
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {offers.map((offer) => {
                  const { expired, display } = getTimeRemaining(offer.deadline);
                  const makerTokenMetadata =
                    tokenMetadata[offer.tokenA.toString()];
                  const takerTokenMetadata =
                    tokenMetadata[offer.tokenB.toString()];

                  return (
                    <OfferCard
                      key={offer.pda.toString()}
                      offer={offer}
                      makerTokenMetadata={makerTokenMetadata || null}
                      takerTokenMetadata={takerTokenMetadata || null}
                      onFulfill={handleFulfillOffer}
                      isExpired={expired}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Offer Card Component
function OfferCard({
  offer,
  makerTokenMetadata,
  takerTokenMetadata,
  onFulfill,
  isExpired,
}: OfferCardProps) {
  const { publicKey } = useWallet();
  const isMaker = publicKey?.toString() === offer.maker.toString();

  const getTimeRemaining = (
    deadline: BN
  ): { expired: boolean; display: string } => {
    const now = Math.floor(Date.now() / 1000);
    const deadlineSeconds = deadline.toNumber();
    const diff = deadlineSeconds - now;

    if (diff <= 0) {
      return { expired: true, display: "Expired" };
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let display = "";
    if (hours > 0) display += `${hours}h `;
    if (minutes > 0) display += `${minutes}m `;
    display += `${seconds}s`;

    return { expired: false, display };
  };

  const { display: timeDisplay } = getTimeRemaining(offer.deadline);
  const truncateAddress = (address: string, chars: number = 8): string => {
    return address.slice(0, chars) + "..." + address.slice(-chars);
  };

  const formatTokenAmount = (amount: BN, decimals: number): string => {
    const divisor = 10 ** decimals;
    const whole = amount.div(new BN(divisor)).toString();
    const fraction = amount
      .mod(new BN(divisor))
      .toString()
      .padStart(decimals, "0")
      .slice(0, 6);
    return `${whole}.${fraction}`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-400">Offer #{offer.seed}</div>
        <div
          className={`text-sm font-semibold ${
            isExpired ? "text-red-400" : "text-green-400"
          }`}
        >
          {timeDisplay}
        </div>
      </div>

      {/* Maker Address */}
      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-1">From</div>
        <div className="text-sm text-gray-300">
          {truncateAddress(offer.maker.toString())}
        </div>
      </div>

      {/* Token Swap Display */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">You Receive</div>
            <div className="text-2xl font-bold text-white">
              {makerTokenMetadata
                ? formatTokenAmount(
                    offer.depositTokenA,
                    makerTokenMetadata.decimals
                  )
                : offer.depositTokenA.toString()}
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4">
            <div className="text-2xl">💵</div>
            <div className="text-white font-semibold">
              {makerTokenMetadata?.symbol ||
                truncateAddress(offer.tokenA.toString(), 4)}
            </div>
          </div>
        </div>

        <div className="flex justify-center py-2">
          <div className="text-purple-400 text-2xl">↓</div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">You Provide</div>
            <div className="text-2xl font-bold text-white">
              {takerTokenMetadata
                ? formatTokenAmount(offer.targetB, takerTokenMetadata.decimals)
                : offer.targetB.toString()}
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4">
            <div className="text-2xl">💰</div>
            <div className="text-white font-semibold">
              {takerTokenMetadata?.symbol ||
                truncateAddress(offer.tokenB.toString(), 4)}
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate */}
      {makerTokenMetadata && takerTokenMetadata && (
        <div className="text-sm text-gray-400 mb-4 text-center">
          Rate: 1 {makerTokenMetadata.symbol} ={" "}
          {(
            parseFloat(
              formatTokenAmount(offer.targetB, takerTokenMetadata.decimals)
            ) /
            parseFloat(
              formatTokenAmount(
                offer.depositTokenA,
                makerTokenMetadata.decimals
              )
            )
          ).toFixed(6)}{" "}
          {takerTokenMetadata.symbol}
        </div>
      )}

      {/* Action Button */}
      {isMaker ? (
        <button
          disabled
          className="w-full bg-gray-700 text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed"
        >
          Your Offer
        </button>
      ) : isExpired ? (
        <button
          disabled
          className="w-full bg-gray-700 text-gray-400 font-semibold py-3 rounded-lg cursor-not-allowed"
        >
          Expired
        </button>
      ) : (
        <button
          onClick={() => onFulfill(offer)}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all"
        >
          Fulfill Offer
        </button>
      )}
    </div>
  );
}
