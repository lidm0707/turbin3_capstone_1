"use client";

import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useState, useEffect } from "react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Program, AnchorProvider, BN, Idl } from "@coral-xyz/anchor";
import {
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  getMint,
} from "@solana/spl-token";
import Link from "next/link";
import idlJson from "../../idl/capstone_1.json";
import * as anchor from "@coral-xyz/anchor";

// Use the IDL directly with type assertion
const idl = idlJson as any;

import {
  PROGRAM_ID,
  createUser,
  createEscrow,
  userExists,
  getOrCreateTokenAccount,
  toTokenAmount,
} from "../../lib/solana";
import { TOKEN_PROGRAM_ID } from "../../lib/constants";

export default function CreateEscrow() {
  const { publicKey, connected, signTransaction } = useWallet();
  const { connection } = useConnection();

  // Token metadata interface
  interface TokenMetadata {
    address: string;
    decimals: number;
    name?: string;
    symbol?: string;
    loading: boolean;
    valid: boolean;
  }

  // Form state - now using arbitrary token addresses
  const [makerTokenAddress, setMakerTokenAddress] = useState<string>("");
  const [makerTokenMetadata, setMakerTokenMetadata] = useState<TokenMetadata>({
    address: "",
    decimals: 6, // default
    loading: false,
    valid: false,
  });
  const [amount, setAmount] = useState<string>("");
  const [takerTokenAddress, setTakerTokenAddress] = useState<string>("");
  const [takerTokenMetadata, setTakerTokenMetadata] = useState<TokenMetadata>({
    address: "",
    decimals: 6, // default
    loading: false,
    valid: false,
  });
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [expireTime, setExpireTime] = useState<string>("300"); // default 5 minutes
  const [timeUnit, setTimeUnit] = useState<"seconds" | "minutes" | "hours">(
    "minutes"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  // Debounce timer for token address lookup
  const [debounceTimers, setDebounceTimers] = useState<{
    [key: string]: NodeJS.Timeout;
  }>({});

  // User's token accounts
  interface TokenAccount {
    mintAddress: string;
    ataAddress: string;
    balance: number;
    decimals: number;
  }

  const [userTokenAccounts, setUserTokenAccounts] = useState<TokenAccount[]>(
    []
  );
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Input mode: manual (text input) or dropdown (select from wallet)
  const [makerInputMode, setMakerInputMode] = useState<"manual" | "dropdown">(
    "manual"
  );
  const [takerInputMode, setTakerInputMode] = useState<"manual" | "dropdown">(
    "manual"
  );
  const [selectedMakerToken, setSelectedMakerToken] = useState<string>("");
  const [selectedTakerToken, setSelectedTakerToken] = useState<string>("");

  // Prevent SSR issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch user's token accounts when wallet connects
  useEffect(() => {
    const fetchUserTokenAccounts = async () => {
      if (!connected || !publicKey || !mounted) {
        return;
      }

      try {
        setLoadingTokens(true);

        // Use getParsedTokenAccountByOwner for easier access to parsed data
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          publicKey,
          {
            programId: TOKEN_PROGRAM_ID,
          }
        );

        const accounts: TokenAccount[] = [];
        for (const account of tokenAccounts.value) {
          try {
            const parsedData = account.account.data.parsed;
            if (!parsedData || !parsedData.info) continue;

            const mintAddress = parsedData.info.mint;
            const tokenAmount = parsedData.info.tokenAmount;
            const balance = tokenAmount.uiAmount || 0;

            // Skip zero-balance accounts
            if (balance === 0) continue;

            // Get decimals from mint
            try {
              const mintInfo = await getMint(
                connection,
                new PublicKey(mintAddress)
              );
              accounts.push({
                mintAddress,
                ataAddress: account.pubkey.toBase58(),
                balance,
                decimals: mintInfo.decimals,
              });
            } catch (err) {
              console.error("Error fetching mint info:", err);
            }
          } catch (err) {
            console.error("Error parsing token account:", err);
          }
        }

        setUserTokenAccounts(accounts);
      } catch (err) {
        console.error("Error fetching token accounts:", err);
      } finally {
        setLoadingTokens(false);
      }
    };

    fetchUserTokenAccounts();
  }, [connected, publicKey, mounted, connection]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers).forEach((timer) => clearTimeout(timer));
    };
  }, [debounceTimers]);

  // Fetch token metadata from mint account
  const fetchTokenMetadata = async (
    address: string,
    setMetadata: (metadata: TokenMetadata) => void
  ): Promise<void> => {
    // Clear any existing timer for this address
    const timerKey = `fetch_${address}`;
    if (debounceTimers[timerKey]) {
      clearTimeout(debounceTimers[timerKey]);
    }

    // Set loading state
    setMetadata({
      address,
      decimals: 6, // default
      loading: true,
      valid: false,
    });

    // Debounce the API call
    const timer = setTimeout(async () => {
      try {
        // Validate address
        const publicKey = new PublicKey(address);

        // Try to get mint info
        const mintInfo = await getMint(connection, publicKey);

        setMetadata({
          address,
          decimals: mintInfo.decimals,
          name: address.slice(0, 8) + "...", // Use truncated address as name
          symbol: address.slice(0, 4), // Use first 4 chars as symbol
          loading: false,
          valid: true,
        });
      } catch (err) {
        console.error("Error fetching token metadata:", err);
        setMetadata({
          address,
          decimals: 6, // default
          loading: false,
          valid: false,
        });
      }
    }, 500);

    setDebounceTimers((prev) => ({ ...prev, [timerKey]: timer }));
  };

  // Handle maker token address change
  const handleMakerTokenAddressChange = (value: string) => {
    setMakerTokenAddress(value);
    if (value) {
      fetchTokenMetadata(value, setMakerTokenMetadata);
    } else {
      setMakerTokenMetadata({
        address: "",
        decimals: 6,
        loading: false,
        valid: false,
      });
    }
  };

  // Handle taker token address change
  const handleTakerTokenAddressChange = (value: string) => {
    setTakerTokenAddress(value);
    if (value) {
      fetchTokenMetadata(value, setTakerTokenMetadata);
    } else {
      setTakerTokenMetadata({
        address: "",
        decimals: 6,
        loading: false,
        valid: false,
      });
    }
  };

  // Convert time to seconds based on unit
  const convertToSeconds = (
    value: string,
    unit: "seconds" | "minutes" | "hours"
  ): number => {
    const num = parseInt(value);
    switch (unit) {
      case "seconds":
        return num;
      case "minutes":
        return num * 60;
      case "hours":
        return num * 3600;
      default:
        return num;
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    setError("");

    if (!connected) {
      setError("Please connect your wallet");
      return false;
    }

    if (!makerTokenMetadata.valid) {
      setError("Please enter a valid maker token address");
      return false;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return false;
    }

    if (!takerTokenMetadata.valid) {
      setError("Please enter a valid taker token address");
      return false;
    }

    if (!targetAmount || parseFloat(targetAmount) <= 0) {
      setError("Please enter a valid target amount");
      return false;
    }

    if (makerTokenMetadata.address === takerTokenMetadata.address) {
      setError("Target token must be different from maker token");
      return false;
    }

    if (!expireTime || parseInt(expireTime) <= 0) {
      setError("Please enter a valid expiration time");
      return false;
    }

    const seconds = convertToSeconds(expireTime, timeUnit);
    if (seconds < 60) {
      setError("Expiration time must be at least 60 seconds");
      return false;
    }

    return true;
  };

  // Convert amount to token units based on decimals
  const toTokenAmountWithDecimals = (
    amount: number,
    decimals: number
  ): number => {
    return Math.floor(amount * 10 ** decimals);
  };

  // Create escrow with real blockchain interaction
  const handleCreateEscrow = async () => {
    if (!validateForm() || !publicKey) return;

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

      console.log("Provider created successfully");
      console.log("Connection endpoint:", connection.rpcEndpoint);
      console.log(
        "Provider public key:",
        provider.wallet?.publicKey?.toString()
      );

      // Load the program with error handling
      console.log("Attempting to load program...");
      console.log("IDL keys:", Object.keys(idl || {}));
      console.log("Program ID:", PROGRAM_ID.toString());
      console.log("Has instructions?", !!(idl && idl.instructions));
      console.log("Has accounts?", !!(idl && idl.accounts));

      let program;
      try {
        console.log("Creating program with IDL address:", idl.address);
        console.log("PROGRAM_ID:", PROGRAM_ID.toString());
        console.log("Provider wallet:", provider.wallet?.publicKey?.toString());

        if (!idl || !idl.instructions || !idl.accounts || !idl.types) {
          throw new Error("IDL is missing required fields");
        }

        console.log("IDL has", idl.instructions.length, "instructions");
        console.log("IDL has", idl.accounts.length, "accounts");
        console.log("IDL has", idl.types.length, "types");

        program = new Program(idl as Idl, provider);
        console.log("Program loaded successfully");
      } catch (programError) {
        console.error("Failed to load program:", programError);
        console.error(
          "Error stack:",
          programError instanceof Error ? programError.stack : "No stack"
        );
        throw new Error(
          `Failed to load program: ${
            programError instanceof Error
              ? programError.message
              : JSON.stringify(programError)
          }`
        );
      }

      // Get token mint addresses from user input
      const tokenA = new PublicKey(makerTokenMetadata.address);
      const tokenB = new PublicKey(takerTokenMetadata.address);

      // Convert amounts to token units using their respective decimals
      const depositTokenA = toTokenAmountWithDecimals(
        parseFloat(amount),
        makerTokenMetadata.decimals
      );
      const targetB = toTokenAmountWithDecimals(
        parseFloat(targetAmount),
        takerTokenMetadata.decimals
      );

      // Convert expiration time to seconds
      const secsDeadline = convertToSeconds(expireTime, timeUnit);

      console.log("Creating escrow with parameters:", {
        tokenA: tokenA.toString(),
        tokenB: tokenB.toString(),
        depositTokenA,
        targetB,
        secsDeadline,
        maker: publicKey.toString(),
        makerTokenDecimals: makerTokenMetadata.decimals,
        takerTokenDecimals: takerTokenMetadata.decimals,
      });

      // Step 1: Check if user exists, create if not
      console.log("Checking if user account exists...");
      const userAccountExists = await userExists(provider, publicKey, program);
      if (!userAccountExists) {
        console.log("User account does not exist, creating...");
        await createUser(provider, publicKey, program);
        console.log("User account created successfully");
      } else {
        console.log("User account already exists");
      }

      // Step 2: Get or create maker's ATA for tokenA
      console.log(
        "Getting or creating maker's ATA for tokenA:",
        tokenA.toString()
      );
      console.log("Provider connection:", provider.connection?.rpcEndpoint);
      console.log(
        "Provider wallet signer exists:",
        !!provider.wallet?.signTransaction
      );
      let makerAtaA;
      try {
        makerAtaA = await getOrCreateTokenAccount(provider, tokenA, publicKey);
        console.log("Maker ATA A:", makerAtaA.toString());
      } catch (ataError) {
        console.error("Failed to get or create ATA:", ataError);
        throw new Error(
          `Failed to get or create token account: ${
            ataError instanceof Error ? ataError.message : "Unknown error"
          }`
        );
      }

      // Step 3: Create escrow
      // Get the user account to find the current escrow count seed
      const [userPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("user"), publicKey.toBuffer()],
        PROGRAM_ID
      );
      const userAccount = await (program.account as any).user.fetch(userPda);
      const escrowSeed = userAccount.escrowCountSeed;

      console.log("Creating escrow with seed:", escrowSeed.toString());

      console.log("Creating escrow transaction...");
      const { tx, escrowPda } = await createEscrow(
        provider,
        publicKey,
        program,
        tokenA,
        tokenB,
        makerAtaA,
        depositTokenA,
        targetB,
        escrowSeed,
        secsDeadline
      );

      console.log("Escrow created successfully!");
      console.log("Transaction signature:", tx);
      console.log("Escrow PDA:", escrowPda.toString());

      setSuccess(
        `Escrow created successfully! Offering ${amount} ${
          makerTokenMetadata.symbol || makerTokenMetadata.address.slice(0, 8)
        } for ${targetAmount} ${
          takerTokenMetadata.symbol || takerTokenMetadata.address.slice(0, 8)
        }. Expires in ${expireTime} ${timeUnit}.`
      );

      // Reset form
      setAmount("");
      setTargetAmount("");
      setMakerTokenAddress("");
      setMakerTokenMetadata({
        address: "",
        decimals: 6,
        loading: false,
        valid: false,
      });
      setTakerTokenAddress("");
      setTakerTokenMetadata({
        address: "",
        decimals: 6,
        loading: false,
        valid: false,
      });
      setExpireTime("300");
    } catch (err) {
      console.error("Error creating escrow:", err);
      setError(
        `Failed to create escrow: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Truncate address for display
  const truncateAddress = (address: string, chars: number = 8): string => {
    if (!address) return "";
    return address.slice(0, chars) + "..." + address.slice(-chars);
  };

  return (
    <div className="px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Create Escrow Offer
        </h1>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
          {!connected ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔐</div>
              <p className="text-gray-300 text-lg mb-6">
                Connect your wallet to create an escrow
              </p>
              <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !text-white !font-semibold !px-8 !py-3 !rounded-lg !text-lg" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Maker Token Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white font-semibold">
                    Token to Offer
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setMakerInputMode("manual");
                        setSelectedMakerToken("");
                      }}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        makerInputMode === "manual"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => {
                        setMakerInputMode("dropdown");
                        setSelectedMakerToken("");
                      }}
                      disabled={!connected || userTokenAccounts.length === 0}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        makerInputMode === "dropdown"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } ${
                        !connected || userTokenAccounts.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      My Tokens
                    </button>
                  </div>
                </div>

                {makerInputMode === "manual" ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={makerTokenAddress}
                      onChange={(e) =>
                        handleMakerTokenAddressChange(e.target.value)
                      }
                      placeholder="Enter token mint address"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {makerTokenMetadata.loading && (
                        <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                      )}
                      {makerTokenMetadata.valid && (
                        <div className="text-green-500 text-sm">✓</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedMakerToken}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedMakerToken(value);
                      setMakerTokenAddress(value);
                      handleMakerTokenAddressChange(value);
                    }}
                    disabled={loadingTokens}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  >
                    <option value="">Select a token from your wallet</option>
                    {userTokenAccounts.map((token) => (
                      <option key={token.ataAddress} value={token.mintAddress}>
                        {token.mintAddress.slice(0, 8)}... - Balance:{" "}
                        {token.balance.toFixed(4)}
                      </option>
                    ))}
                  </select>
                )}

                {makerInputMode === "manual" && makerTokenMetadata.valid && (
                  <div className="mt-2 text-sm text-gray-400">
                    {makerTokenMetadata.name} ({makerTokenMetadata.symbol}) -{" "}
                    {makerTokenMetadata.decimals} decimals
                  </div>
                )}
                {makerInputMode === "manual" &&
                  !makerTokenMetadata.valid &&
                  makerTokenAddress &&
                  !makerTokenMetadata.loading && (
                    <div className="mt-2 text-sm text-red-400">
                      Invalid token address
                    </div>
                  )}
                {makerInputMode === "dropdown" &&
                  !connected &&
                  userTokenAccounts.length === 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      Connect your wallet to see your tokens
                    </div>
                  )}
                {makerInputMode === "dropdown" &&
                  connected &&
                  userTokenAccounts.length === 0 &&
                  !loadingTokens && (
                    <div className="mt-2 text-sm text-gray-400">
                      No tokens found in your wallet
                    </div>
                  )}
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Amount to Offer
                </label>
                <input
                  type="number"
                  step={
                    makerTokenMetadata.valid
                      ? `1e-${makerTokenMetadata.decimals}`
                      : "0.000001"
                  }
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Arrow Down */}
              <div className="flex justify-center">
                <div className="text-purple-400 text-4xl">↓</div>
              </div>

              {/* Taker Token Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-white font-semibold">
                    Token to Receive
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setTakerInputMode("manual");
                        setSelectedTakerToken("");
                      }}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        takerInputMode === "manual"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      Manual
                    </button>
                    <button
                      onClick={() => {
                        setTakerInputMode("dropdown");
                        setSelectedTakerToken("");
                      }}
                      disabled={!connected || userTokenAccounts.length === 0}
                      className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        takerInputMode === "dropdown"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      } ${
                        !connected || userTokenAccounts.length === 0
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      My Tokens
                    </button>
                  </div>
                </div>

                {takerInputMode === "manual" ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={takerTokenAddress}
                      onChange={(e) =>
                        handleTakerTokenAddressChange(e.target.value)
                      }
                      placeholder="Enter token mint address"
                      className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 pr-20"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                      {takerTokenMetadata.loading && (
                        <div className="animate-spin h-5 w-5 border-2 border-purple-500 border-t-transparent rounded-full" />
                      )}
                      {takerTokenMetadata.valid && (
                        <div className="text-green-500 text-sm">✓</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <select
                    value={selectedTakerToken}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSelectedTakerToken(value);
                      setTakerTokenAddress(value);
                      handleTakerTokenAddressChange(value);
                    }}
                    disabled={loadingTokens}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  >
                    <option value="">Select a token from your wallet</option>
                    {userTokenAccounts.map((token) => (
                      <option key={token.ataAddress} value={token.mintAddress}>
                        {token.mintAddress.slice(0, 8)}... - Balance:{" "}
                        {token.balance.toFixed(4)}
                      </option>
                    ))}
                  </select>
                )}

                {takerInputMode === "manual" && takerTokenMetadata.valid && (
                  <div className="mt-2 text-sm text-gray-400">
                    {takerTokenMetadata.name} ({takerTokenMetadata.symbol}) -{" "}
                    {takerTokenMetadata.decimals} decimals
                  </div>
                )}
                {takerInputMode === "manual" &&
                  !takerTokenMetadata.valid &&
                  takerTokenAddress &&
                  !takerTokenMetadata.loading && (
                    <div className="mt-2 text-sm text-red-400">
                      Invalid token address
                    </div>
                  )}
                {takerInputMode === "dropdown" &&
                  !connected &&
                  userTokenAccounts.length === 0 && (
                    <div className="mt-2 text-sm text-gray-400">
                      Connect your wallet to see your tokens
                    </div>
                  )}
                {takerInputMode === "dropdown" &&
                  connected &&
                  userTokenAccounts.length === 0 &&
                  !loadingTokens && (
                    <div className="mt-2 text-sm text-gray-400">
                      No tokens found in your wallet
                    </div>
                  )}
              </div>

              {/* Target Amount Input */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Amount to Receive
                </label>
                <input
                  type="number"
                  step={
                    takerTokenMetadata.valid
                      ? `1e-${takerTokenMetadata.decimals}`
                      : "0.000001"
                  }
                  min="0"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Exchange Rate Display */}
              {amount &&
                targetAmount &&
                makerTokenMetadata.valid &&
                takerTokenMetadata.valid && (
                  <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
                    <div className="text-gray-300 text-sm mb-1">
                      Exchange Rate
                    </div>
                    <div className="text-white font-semibold">
                      1{" "}
                      {makerTokenMetadata.symbol ||
                        truncateAddress(makerTokenMetadata.address)}{" "}
                      ={" "}
                      {(parseFloat(targetAmount) / parseFloat(amount)).toFixed(
                        6
                      )}{" "}
                      {takerTokenMetadata.symbol ||
                        truncateAddress(takerTokenMetadata.address)}
                    </div>
                  </div>
                )}

              {/* Expiration Time */}
              <div>
                <label className="block text-white font-semibold mb-3">
                  Expiration Time
                </label>
                <div className="flex space-x-3">
                  <input
                    type="number"
                    min="1"
                    value={expireTime}
                    onChange={(e) => setExpireTime(e.target.value)}
                    placeholder="Enter time"
                    className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                  <select
                    value={timeUnit}
                    onChange={(e) => setTimeUnit(e.target.value as any)}
                    className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-600 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="seconds">Seconds</option>
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  Offer expires in {convertToSeconds(expireTime, timeUnit)}{" "}
                  seconds
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

              {/* Submit Button */}
              <button
                onClick={handleCreateEscrow}
                disabled={
                  loading ||
                  !makerTokenMetadata.valid ||
                  !takerTokenMetadata.valid
                }
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating Escrow..." : "Create Escrow Offer"}
              </button>

              {/* Info Box */}
              <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">ℹ️</div>
                  <div className="text-gray-300 text-sm">
                    <div className="font-semibold text-white mb-1">
                      How it works:
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your tokens will be locked in escrow</li>
                      <li>Anyone can fulfill this offer before expiration</li>
                      <li>
                        If not fulfilled, your funds will be automatically
                        refunded
                      </li>
                      <li>Network fees apply</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View All Offers Link */}
        <div className="mt-6 text-center">
          <Link
            href="/escrows"
            className="text-purple-300 hover:text-purple-200 transition-colors"
          >
            View all available escrow offers →
          </Link>
        </div>
      </div>
    </div>
  );
}
