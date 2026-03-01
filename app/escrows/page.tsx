"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import { PublicKey } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
import Link from "next/link";
import idlJson from "../idl/capstone_1.json";

const idl = idlJson as any;

import {
  PROGRAM_ID,
  userExists,
  createUser,
  dealToken,
  refund,
  deriveUserPda,
  deriveEscrowPda,
  deriveVaultAddress,
  toTokenAmount,
  getOrCreateTokenAccount,
} from "../lib/solana";

interface EscrowData {
  pda: PublicKey;
  maker: PublicKey;
  tokenA: PublicKey;
  tokenB: PublicKey;
  depositTokenA: BN;
  targetB: BN;
  deadline: BN;
  seed: number;
}

interface TokenMetadata {
  address: string;
  decimals: number;
  name?: string;
  symbol?: string;
}

export default function EscrowsPage() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [mounted, setMounted] = useState(false);
  const [escrows, setEscrows] = useState<EscrowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "expired">("all");
  const [tokenMetadata, setTokenMetadata] = useState<{
    [key: string]: TokenMetadata;
  }>({});

  // Prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all escrows from the blockchain
  useEffect(() => {
    if (!mounted) return;
    fetchEscrows();
  }, [mounted, connection]);

  // Fetch token metadata for a given address
  const fetchTokenMetadata = async (
    address: PublicKey
  ): Promise<TokenMetadata | null> => {
    try {
      const mintInfo = await getMint(connection, address);
      return {
        address: address.toString(),
        decimals: mintInfo.decimals,
        name: address.toString().slice(0, 8) + "...",
        symbol: address.toString().slice(0, 4),
      };
    } catch (err) {
      console.error("Error fetching token metadata:", err);
      return null;
    }
  };

  // Fetch all escrow accounts from the blockchain
  const fetchEscrows = async () => {
    try {
      setLoading(true);
      setError("");

      // Get all program accounts and try to decode them as escrows
      const programAccounts = await connection.getProgramAccounts(PROGRAM_ID);

      const escrowData: EscrowData[] = [];
      const metadataPromises: Promise<void>[] = [];

      // Load program to decode accounts
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
          };
          escrowData.push(escrow);

          // Fetch metadata for both tokens if not already cached
          const tokenAKey = escrow.tokenA.toString();
          const tokenBKey = escrow.tokenB.toString();

          if (!tokenMetadata[tokenAKey]) {
            metadataPromises.push(
              fetchTokenMetadata(escrow.tokenA).then((metadata) => {
                if (metadata) {
                  setTokenMetadata((prev) => ({
                    ...prev,
                    [tokenAKey]: metadata,
                  }));
                }
              })
            );
          }

          if (!tokenMetadata[tokenBKey]) {
            metadataPromises.push(
              fetchTokenMetadata(escrow.tokenB).then((metadata) => {
                if (metadata) {
                  setTokenMetadata((prev) => ({
                    ...prev,
                    [tokenBKey]: metadata,
                  }));
                }
              })
            );
          }
        } catch (err) {
          // This account is not an escrow account, skip it
          // (could be a user account or other program account)
        }
      }

      setEscrows(escrowData);

      // Wait for all metadata to be fetched
      await Promise.all(metadataPromises);
    } catch (err) {
      console.error("Error fetching escrows:", err);
      setError("Failed to fetch escrows from the blockchain");
    } finally {
      setLoading(false);
    }
  };

  // Don't render wallet-dependent content until mounted
  if (!mounted) {
    return null;
  }

  // Calculate time remaining
  const getTimeRemaining = (
    deadline: BN
  ): { expired: boolean; time: string } => {
    const now = Math.floor(Date.now() / 1000);
    const deadlineSeconds = deadline.toNumber();
    const diff = deadlineSeconds - now;

    if (diff <= 0) {
      return { expired: true, time: "Expired" };
    }

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    let time = "";
    if (hours > 0) time += `${hours}h `;
    if (minutes > 0) time += `${minutes}m `;
    time += `${seconds}s`;

    return { expired: false, time: `${time} remaining` };
  };

  // Filter escrows based on selected filter
  const filteredEscrows = escrows.filter((escrow: EscrowData) => {
    const { expired } = getTimeRemaining(escrow.deadline);
    if (filter === "all") return true;
    if (filter === "active") return !expired;
    if (filter === "expired") return expired;
    return true;
  });

  // Deal with escrow
  const handleDeal = async (escrow: EscrowData) => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet to deal with escrow");
      return;
    }

    setLoading(true);
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
        await createUser(provider, publicKey, program);
      }

      // Derive necessary addresses
      const makerPda = deriveUserPda(escrow.maker);
      const makerAtaA = await getAssociatedTokenAddress(
        escrow.tokenA,
        escrow.maker
      );
      const takerAtaA = await getOrCreateTokenAccount(
        provider,
        escrow.tokenA,
        publicKey
      );
      const takerAtaB = await getOrCreateTokenAccount(
        provider,
        escrow.tokenB,
        publicKey
      );
      const makerAtaB = await getAssociatedTokenAddress(
        escrow.tokenB,
        escrow.maker
      );

      // Check if maker's ATA B exists
      const makerAtaBInfo = await provider.connection.getAccountInfo(makerAtaB);
      if (!makerAtaBInfo) {
        throw new Error(
          "Maker does not have an associated token account for token B. The maker needs to initialize their token account first."
        );
      }

      // Fulfill the escrow
      const tx = await dealToken(
        provider,
        publicKey,
        program,
        escrow.pda,
        escrow.maker,
        escrow.tokenA,
        makerAtaA,
        takerAtaA,
        escrow.tokenB,
        takerAtaB,
        makerAtaB,
        escrow.targetB.toNumber()
      );

      setSuccess(`Escrow fulfilled successfully! Transaction: ${tx}`);

      // Refresh the escrow list
      await fetchEscrows();
    } catch (err) {
      console.error("Error dealing with escrow:", err);
      setError(
        `Failed to deal with escrow: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Refund escrow
  const handleRefund = async (escrow: EscrowData) => {
    if (!connected || !publicKey) {
      setError("Please connect your wallet to refund");
      return;
    }

    if (publicKey.toString() !== escrow.maker.toString()) {
      setError("Only the maker can refund this escrow");
      return;
    }

    setLoading(true);
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

      // Derive necessary addresses
      const makerAtaA = await getAssociatedTokenAddress(
        escrow.tokenA,
        publicKey
      );

      // Refund the escrow
      const tx = await refund(
        provider,
        publicKey,
        program,
        escrow.pda,
        escrow.tokenA,
        makerAtaA
      );

      setSuccess(`Refund successful! Transaction: ${tx}`);

      // Refresh the escrow list
      await fetchEscrows();
    } catch (err) {
      console.error("Error refunding escrow:", err);
      setError(
        `Failed to refund: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Truncate address for display
  const truncateAddress = (
    address: PublicKey | string,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Available Escrow Offers
          </h1>
          <Link
            href="/create"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
          >
            + Create Offer
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-purple-500/30 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              All Offers
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "active"
                  ? "bg-green-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Active Only
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === "expired"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              Expired Only
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200 mb-6">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-4 text-green-200 mb-6">
            {success}
          </div>
        )}

        {!connected ? (
          <div className="bg-purple-900/50 border border-purple-500 rounded-lg p-8 mb-6 text-center">
            <div className="text-6xl mb-4">🔐</div>
            <p className="text-gray-300 text-lg mb-6">
              Connect your wallet to deal with escrows
            </p>
            <WalletMultiButton className="bg-purple-600! hover:bg-purple-700! text-white! font-semibold! px-8! py-3! rounded-lg! text-lg!" />
          </div>
        ) : loading ? (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-300">Loading escrow offers...</p>
          </div>
        ) : (
          /* Escrow Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEscrows.length === 0 ? (
              <div className="col-span-full bg-white/10 backdrop-blur-sm rounded-lg p-12 border border-purple-500/30 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-300 text-xl mb-2">No escrows found</p>
                <p className="text-gray-400">
                  {filter === "all" && "Create your first offer to get started"}
                  {filter === "active" && "No active escrows available"}
                  {filter === "expired" && "No expired escrows to refund"}
                </p>
              </div>
            ) : (
              filteredEscrows.map((escrow: EscrowData) => {
                const { expired, time } = getTimeRemaining(escrow.deadline);
                const isMaker =
                  publicKey?.toString() === escrow.maker.toString();
                const tokenAMetadata = tokenMetadata[escrow.tokenA.toString()];
                const tokenBMetadata = tokenMetadata[escrow.tokenB.toString()];

                return (
                  <div
                    key={escrow.pda.toString()}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-purple-500/30 hover:border-purple-400 transition-all"
                  >
                    {/* Status Badge */}
                    <div className="flex justify-between items-start mb-4">
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          expired
                            ? "bg-red-900/50 text-red-300 border border-red-500/50"
                            : "bg-green-900/50 text-green-300 border border-green-500/50"
                        }`}
                      >
                        {expired ? "Expired" : "Active"}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {expired ? "⏰ " : "⏱️ "}
                        {time}
                      </div>
                    </div>

                    {/* Maker Info */}
                    <div className="mb-4 pb-4 border-b border-gray-600">
                      <div className="text-gray-400 text-sm mb-1">Maker</div>
                      <div className="text-white font-mono text-sm truncate">
                        {truncateAddress(escrow.maker)}
                      </div>
                      {isMaker && (
                        <div className="mt-1 text-purple-300 text-xs">
                          Your offer
                        </div>
                      )}
                    </div>

                    {/* Token Swap Display */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-center">
                          <div className="text-3xl mb-1">💵</div>
                          <div className="text-white font-semibold">
                            {tokenAMetadata
                              ? formatTokenAmount(
                                  escrow.depositTokenA,
                                  tokenAMetadata.decimals
                                )
                              : escrow.depositTokenA.toString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {tokenAMetadata?.symbol ||
                              truncateAddress(escrow.tokenA, 4)}
                          </div>
                        </div>

                        <div className="text-purple-400 text-2xl">↔</div>

                        <div className="text-center">
                          <div className="text-3xl mb-1">💰</div>
                          <div className="text-white font-semibold">
                            {tokenBMetadata
                              ? formatTokenAmount(
                                  escrow.targetB,
                                  tokenBMetadata.decimals
                                )
                              : escrow.targetB.toString()}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {tokenBMetadata?.symbol ||
                              truncateAddress(escrow.tokenB, 4)}
                          </div>
                        </div>
                      </div>

                      {/* Exchange Rate */}
                      {tokenAMetadata && tokenBMetadata && (
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                          <div className="text-gray-300 text-xs mb-1">
                            Exchange Rate
                          </div>
                          <div className="text-white font-semibold text-sm">
                            1 {tokenAMetadata.symbol} ={" "}
                            {(
                              parseFloat(
                                formatTokenAmount(
                                  escrow.targetB,
                                  tokenBMetadata.decimals
                                )
                              ) /
                              parseFloat(
                                formatTokenAmount(
                                  escrow.depositTokenA,
                                  tokenAMetadata.decimals
                                )
                              )
                            ).toFixed(6)}{" "}
                            {tokenBMetadata.symbol}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {!expired ? (
                      <button
                        onClick={() => handleDeal(escrow)}
                        disabled={loading || !connected || isMaker}
                        className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading
                          ? "Processing..."
                          : `Deal with ${
                              tokenBMetadata
                                ? formatTokenAmount(
                                    escrow.targetB,
                                    tokenBMetadata.decimals
                                  )
                                : escrow.targetB.toString()
                            } ${
                              tokenBMetadata?.symbol ||
                              truncateAddress(escrow.tokenB, 4)
                            }`}
                      </button>
                    ) : (
                      <>
                        {isMaker ? (
                          <button
                            onClick={() => handleRefund(escrow)}
                            disabled={loading || !connected}
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loading ? "Processing..." : "Refund Your Funds"}
                          </button>
                        ) : (
                          <div className="w-full bg-gray-700 text-gray-400 font-semibold py-3 rounded-lg text-center">
                            Expired - awaiting refund
                          </div>
                        )}
                      </>
                    )}

                    {/* Warning for maker */}
                    {isMaker && !expired && (
                      <div className="mt-3 text-center text-xs text-yellow-400">
                        ⚠️ You cannot deal with your own offer
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setSuccess("");
              setError("");
              fetchEscrows();
            }}
            disabled={loading}
            className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            Refresh Offers
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-900/30 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-xl font-semibold text-white mb-4">
            💡 How to Use
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-purple-300 font-semibold mb-2">
                For Takers (Dealing)
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Browse active escrow offers</li>
                <li>• Click "Deal" to accept an offer</li>
                <li>• You'll receive the deposited tokens</li>
                <li>• You must have the target token amount</li>
              </ul>
            </div>
            <div>
              <h4 className="text-purple-300 font-semibold mb-2">
                For Makers (Refunds)
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Expired offers show "Refund Your Funds"</li>
                <li>• Only you can refund your own offers</li>
                <li>• Your deposited tokens are returned</li>
                <li>• Escrow is closed after refund</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
