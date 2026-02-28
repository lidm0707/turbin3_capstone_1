import { PublicKey } from "@solana/web3.js";

// Solana Program Constants
export const PROGRAM_ID = new PublicKey(
  "A4L1zqBRLrnL2ma8Qxsg1WQ5gAkFxFzT6urQwiaDRhhm"
);

// Token Mint Addresses (Devnet - replace with mainnet addresses for production)
export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
export const USDT_MINT = new PublicKey(
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);

// Token Program IDs
export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

// Token Configuration
export const TOKEN_DECIMALS = 6;

// RPC Endpoint (Devnet)
export const RPC_ENDPOINT = "https://api.devnet.solana.com";

// Network
export const NETWORK = "devnet";

// Time Constants
export const MIN_EXPIRATION_SECONDS = 60; // Minimum 1 minute
export const DEFAULT_EXPIRATION_SECONDS = 300; // Default 5 minutes
export const MAX_EXPIRATION_SECONDS = 86400; // Maximum 24 hours

// PDA Seeds
export const USER_SEED = "user";
export const ESCROW_SEED = "es";

// Currency Symbols
export const USDC_SYMBOL = "USDC";
export const USDT_SYMBOL = "USDT";

// UI Constants
export const REFRESH_INTERVAL = 30000; // 30 seconds

// Error Messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: "Please connect your wallet",
  INSUFFICIENT_FUNDS: "Insufficient funds",
  INVALID_AMOUNT: "Invalid amount",
  ESCROW_EXPIRED: "Escrow has expired",
  ESCROW_NOT_FOUND: "Escrow not found",
  TRANSACTION_FAILED: "Transaction failed",
  NETWORK_ERROR: "Network error",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  ESCROW_CREATED: "Escrow created successfully",
  DEAL_COMPLETED: "Deal completed successfully",
  REFUND_COMPLETED: "Refund completed successfully",
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  CREATING_ESCROW: "Creating escrow...",
  DEALING: "Processing deal...",
  REFUNDING: "Processing refund...",
  LOADING_DATA: "Loading data...",
} as const;
