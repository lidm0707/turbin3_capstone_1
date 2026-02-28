import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Program, AnchorProvider, BN } from "@coral-xyz/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";

// Token decimals for USDC/USDT
export const TOKEN_DECIMALS = 6;

// Token mint addresses (devnet)
export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);
export const USDT_MINT = new PublicKey(
  "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB"
);

// Program ID from lib.rs
export const PROGRAM_ID = new PublicKey(
  "A4L1zqBRLrnL2ma8Qxsg1WQ5gAkFxFzT6urQwiaDRhhm"
);

/**
 * Derive User PDA
 * @param maker The maker's public key
 * @returns The User PDA and bump
 */
export const deriveUserPda = (maker: PublicKey): [PublicKey, number] => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("user"), maker.toBuffer()],
    PROGRAM_ID
  );
};

/**
 * Derive Escrow PDA
 * @param maker The maker's public key
 * @param escrowSeed The escrow seed number
 * @returns The Escrow PDA and bump
 */
export const deriveEscrowPda = (
  maker: PublicKey,
  escrowSeed: number
): [PublicKey, number] => {
  const escrowSeedBuffer = Buffer.alloc(8);
  const bn = new BN(escrowSeed);
  const low = bn.and(new BN(0xffffffff)).toNumber();
  const high = bn.shrn(32).toNumber();
  escrowSeedBuffer.writeUInt32LE(low, 0);
  escrowSeedBuffer.writeUInt32LE(high, 4);

  return PublicKey.findProgramAddressSync(
    [Buffer.from("es"), maker.toBuffer(), escrowSeedBuffer],
    PROGRAM_ID
  );
};

/**
 * Derive Vault ATA address for an escrow
 * @param escrowPda The escrow PDA
 * @param tokenMint The token mint
 * @returns The vault ATA address
 */
export const deriveVaultAddress = async (
  escrowPda: PublicKey,
  tokenMint: PublicKey
): Promise<PublicKey> => {
  return await getAssociatedTokenAddress(
    tokenMint,
    escrowPda,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
};

/**
 * Create user account if it doesn't exist
 * @param provider The AnchorProvider
 * @param maker The maker's keypair
 * @param program The anchor program
 */
export const createUser = async (
  provider: AnchorProvider,
  maker: PublicKey,
  program: Program
): Promise<string> => {
  try {
    const [userPda] = deriveUserPda(maker);

    const tx = await program.methods
      .createUser()
      .accounts({
        maker: maker,
        user: userPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    return tx;
  } catch (error) {
    // Check if user rejected the transaction
    if (error && typeof error === "object" && "message" in error) {
      const errorMsg = (error as { message: string }).message;
      if (
        errorMsg.includes("User rejected") ||
        errorMsg.includes("User rejected the request")
      ) {
        throw new Error("Transaction rejected by user");
      }
    }
    throw error;
  }
};

/**
 * Create escrow
 * @param provider The AnchorProvider
 * @param maker The maker's public key
 * @param program The anchor program
 * @param tokenA The token mint for deposit (e.g., USDC or USDT)
 * @param tokenB The target token mint (e.g., USDC or USDT)
 * @param makerAtaA The maker's ATA for token A
 * @param depositTokenA The amount of token A to deposit
 * @param targetB The target amount of token B
 * @param escrowSeed The escrow seed number
 * @param secsDeadline The deadline in seconds
 */
export const createEscrow = async (
  provider: AnchorProvider,
  maker: PublicKey,
  program: Program,
  tokenA: PublicKey,
  tokenB: PublicKey,
  makerAtaA: PublicKey,
  depositTokenA: number,
  targetB: number,
  escrowSeed: number,
  secsDeadline: number
): Promise<{ tx: string; escrowPda: PublicKey }> => {
  const [userPda] = deriveUserPda(maker);
  const [escrowPda] = deriveEscrowPda(maker, escrowSeed);

  const tx = await program.methods
    .createEscrow(new BN(depositTokenA), new BN(targetB), secsDeadline)
    .accounts({
      maker: maker,
      user: userPda,
      escrow: escrowPda,
      tokenA: tokenA,
      tokenB: tokenB,
      makerAtaA: makerAtaA,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  return { tx, escrowPda };
};

/**
 * Deal with escrow (fulfill it)
 * @param provider The AnchorProvider
 * @param taker The taker's public key
 * @param program The anchor program
 * @param escrowPda The escrow PDA
 * @param maker The maker's public key
 * @param tokenA The token mint for token A
 * @param makerAtaA The maker's ATA for token A
 * @param takerAtaA The taker's ATA for token A
 * @param tokenB The token mint for token B
 * @param takerAtaB The taker's ATA for token B
 * @param makerAtaB The maker's ATA for token B
 * @param depositTokenB The amount of token B to deposit
 */
export const dealToken = async (
  provider: AnchorProvider,
  taker: PublicKey,
  program: Program,
  escrowPda: PublicKey,
  maker: PublicKey,
  tokenA: PublicKey,
  makerAtaA: PublicKey,
  takerAtaA: PublicKey,
  tokenB: PublicKey,
  takerAtaB: PublicKey,
  makerAtaB: PublicKey,
  depositTokenB: number
): Promise<string> => {
  const vault = await deriveVaultAddress(escrowPda, tokenA);

  const tx = await program.methods
    .dealToken(new BN(depositTokenB))
    .accounts({
      taker: taker,
      escrow: escrowPda,
      maker: maker,
      tokenA: tokenA,
      makerAtaA: makerAtaA,
      takerAtaA: takerAtaA,
      tokenB: tokenB,
      takerAtaB: takerAtaB,
      makerAtaB: makerAtaB,
      vault: vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
};

/**
 * Refund escrow
 * @param provider The AnchorProvider
 * @param maker The maker's public key
 * @param program The anchor program
 * @param escrowPda The escrow PDA
 * @param tokenA The token mint for token A
 * @param makerAtaA The maker's ATA for token A
 */
export const refund = async (
  provider: AnchorProvider,
  maker: PublicKey,
  program: Program,
  escrowPda: PublicKey,
  tokenA: PublicKey,
  makerAtaA: PublicKey
): Promise<string> => {
  const vault = await deriveVaultAddress(escrowPda, tokenA);

  const tx = await program.methods
    .refund()
    .accounts({
      maker: maker,
      escrow: escrowPda,
      tokenA: tokenA,
      tokenAtaA: makerAtaA,
      vault: vault,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .rpc();

  return tx;
};

/**
 * Get or create token account
 * @param provider The AnchorProvider
 * @param mint The token mint
 * @param owner The owner's public key
 * @returns The token account address
 */
export const getOrCreateTokenAccount = async (
  provider: AnchorProvider,
  mint: PublicKey,
  owner: PublicKey
): Promise<PublicKey> => {
  // Get the ATA address
  const ataAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );

  // Check if the account exists
  const accountInfo = await provider.connection.getAccountInfo(ataAddress);

  if (accountInfo) {
    // Account already exists
    return ataAddress;
  }

  // Account doesn't exist, create it using the wallet adapter
  const transaction = new Transaction().add(
    createAssociatedTokenAccountInstruction(
      provider.wallet.publicKey,
      ataAddress,
      owner,
      mint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );

  const { blockhash } = await provider.connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = provider.wallet.publicKey;

  const signedTx = await provider.wallet.signTransaction(transaction);
  const signature = await provider.connection.sendRawTransaction(
    signedTx.serialize()
  );

  await provider.connection.confirmTransaction(signature);

  return ataAddress;
};

/**
 * Get token balance
 * @param provider The AnchorProvider
 * @param tokenAccount The token account address
 * @returns The token balance
 */
export const getTokenBalance = async (
  provider: AnchorProvider,
  tokenAccount: PublicKey
): Promise<number> => {
  const balance = await provider.connection.getTokenAccountBalance(
    tokenAccount
  );
  return balance.value.uiAmount || 0;
};

/**
 * Convert human-readable token amount to smallest units
 * @param amount The human-readable amount (e.g., 1.5 for 1.5 USDC)
 * @returns The amount in smallest units (e.g., 1500000 for 1.5 USDC with 6 decimals)
 */
export const toTokenAmount = (amount: number): number => {
  return Math.floor(amount * 10 ** TOKEN_DECIMALS);
};

/**
 * Convert smallest units to human-readable token amount
 * @param amount The amount in smallest units (e.g., 1500000)
 * @returns The human-readable amount (e.g., 1.5)
 */
export const fromTokenAmount = (amount: number): number => {
  return amount / 10 ** TOKEN_DECIMALS;
};

/**
 * Format token amount for display
 * @param amount The amount in smallest units
 * @param decimals Number of decimals to display
 * @returns Formatted string (e.g., "1.500000")
 */
export const formatTokenAmount = (
  amount: number,
  decimals: number = 6
): string => {
  return fromTokenAmount(amount).toFixed(decimals);
};

/**
 * Check if user account exists
 * @param provider The AnchorProvider
 * @param maker The maker's public key
 * @param program The anchor program
 * @returns True if user account exists
 */
export const userExists = async (
  provider: AnchorProvider,
  maker: PublicKey,
  program: Program
): Promise<boolean> => {
  try {
    const [userPda] = deriveUserPda(maker);
    await (program.account as any).user.fetch(userPda);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch all escrows for a user
 * @param provider The AnchorProvider
 * @param maker The maker's public key
 * @param program The anchor program
 * @returns Array of escrow accounts
 */
export const fetchUserEscrows = async (
  provider: AnchorProvider,
  maker: PublicKey,
  program: Program
): Promise<any[]> => {
  try {
    const [userPda] = deriveUserPda(maker);
    const userAccount = await (program.account as any).user.fetch(userPda);
    const escrowCount = userAccount.escrowCountSeed.toNumber();

    const escrows = [];
    for (let i = 1; i < escrowCount; i++) {
      const [escrowPda] = deriveEscrowPda(maker, i);
      try {
        const escrow = await (program.account as any).escrow.fetch(escrowPda);
        escrows.push({
          ...escrow,
          pda: escrowPda,
          seed: i,
        });
      } catch (error) {
        // Escrow might be closed, skip
      }
    }
    return escrows;
  } catch (error) {
    console.error("Error fetching user escrows:", error);
    return [];
  }
};

/**
 * Check if escrow is expired
 * @param deadline The deadline timestamp in seconds
 * @returns True if expired
 */
export const isEscrowExpired = (deadline: number): boolean => {
  return Date.now() / 1000 > deadline;
};

/**
 * Calculate time remaining for escrow
 * @param deadline The deadline timestamp in seconds
 * @returns Object with time remaining info
 */
export const getTimeRemaining = (
  deadline: number
): {
  expired: boolean;
  seconds: number;
  minutes: number;
  hours: number;
  display: string;
} => {
  const now = Math.floor(Date.now() / 1000);
  const diff = deadline - now;

  if (diff <= 0) {
    return {
      expired: true,
      seconds: 0,
      minutes: 0,
      hours: 0,
      display: "Expired",
    };
  }

  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;

  let display = "";
  if (hours > 0) {
    display += `${hours}h `;
  }
  if (minutes > 0) {
    display += `${minutes}m `;
  }
  display += `${seconds}s`;
  display += " remaining";

  return {
    expired: false,
    seconds,
    minutes,
    hours,
    display,
  };
};
