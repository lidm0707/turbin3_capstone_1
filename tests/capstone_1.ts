import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
// import { Capstone1 } from "../target/types/capstone_1";
import { Capstone1 } from "../types/capstone_1";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  mintTo,
  createMint,
} from "@solana/spl-token";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { assert } from "chai";

describe("capstone_1", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.capstone1 as Program<Capstone1>;

  // Token decimals for USDC/USDT
  const TOKEN_DECIMALS = 6;

  // Token amounts
  const TOKEN_AMOUNT_10 = 10 * 10 ** TOKEN_DECIMALS; // 10 tokens
  const TOKEN_AMOUNT_1 = 1 * 10 ** TOKEN_DECIMALS; // 1 token
  const TOKEN_AMOUNT_5 = 5 * 10 ** TOKEN_DECIMALS; // 5 tokens
  const TOKEN_AMOUNT_2 = 2 * 10 ** TOKEN_DECIMALS; // 2 tokens

  // Key pairs
  let maker: Keypair;
  let taker: Keypair;

  // Token mints
  let usdcMint: PublicKey;
  let usdtMint: PublicKey;

  // PDA seeds
  let userPda: PublicKey;
  let userBump: number;

  // Escrow PDAs
  let escrow1Pda: PublicKey;
  let escrow1Bump: number;
  let escrow2Pda: PublicKey;
  let escrow2Bump: number;

  // Token accounts
  let makerUsdcAta: PublicKey;
  let makerUsdtAta: PublicKey;
  let takerUsdcAta: PublicKey;
  let takerUsdtAta: PublicKey;
  let escrow1Vault: PublicKey;
  let escrow2Vault: PublicKey;

  it("1. Airdrop SOL for test", async () => {
    // Create new keypairs for maker and taker
    maker = Keypair.generate();
    taker = Keypair.generate();

    // Airdrop SOL to maker
    const airdropSig1 = await provider.connection.requestAirdrop(
      maker.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig1);

    // Airdrop SOL to taker
    const airdropSig2 = await provider.connection.requestAirdrop(
      taker.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(airdropSig2);

    // Verify balances
    const makerBalance = await provider.connection.getBalance(maker.publicKey);
    const takerBalance = await provider.connection.getBalance(taker.publicKey);

    console.log("Maker SOL balance:", makerBalance / LAMPORTS_PER_SOL);
    console.log("Taker SOL balance:", takerBalance / LAMPORTS_PER_SOL);

    assert.isAtLeast(
      makerBalance,
      LAMPORTS_PER_SOL,
      "Maker should have at least 1 SOL"
    );
    assert.isAtLeast(
      takerBalance,
      LAMPORTS_PER_SOL,
      "Taker should have at least 1 SOL"
    );
  });

  it("2. Create token mints and swap SOL to USDC (10) and USDT (10)", async () => {
    // Create USDC mint
    usdcMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      TOKEN_DECIMALS
    );

    // Create USDT mint
    usdtMint = await createMint(
      provider.connection,
      provider.wallet.payer,
      provider.wallet.publicKey,
      null,
      TOKEN_DECIMALS
    );

    console.log("USDC Mint:", usdcMint.toBase58());
    console.log("USDT Mint:", usdtMint.toBase58());

    // Create or get ATAs for maker
    makerUsdcAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        maker,
        usdcMint,
        maker.publicKey
      )
    ).address;

    makerUsdtAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        maker,
        usdtMint,
        maker.publicKey
      )
    ).address;

    // Create or get ATAs for taker
    takerUsdcAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        taker,
        usdcMint,
        taker.publicKey
      )
    ).address;

    takerUsdtAta = (
      await getOrCreateAssociatedTokenAccount(
        provider.connection,
        taker,
        usdtMint,
        taker.publicKey
      )
    ).address;

    // Mint 10 USDC to maker (simulating swap SOL to USDC)
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      usdcMint,
      makerUsdcAta,
      provider.wallet.publicKey,
      TOKEN_AMOUNT_10
    );

    // Mint 10 USDT to taker (so taker can fulfill escrows)
    await mintTo(
      provider.connection,
      provider.wallet.payer,
      usdtMint,
      takerUsdtAta,
      provider.wallet.publicKey,
      TOKEN_AMOUNT_10
    );

    // Verify balances
    const makerUsdcBalance = await provider.connection.getTokenAccountBalance(
      makerUsdcAta
    );
    const takerUsdtBalance = await provider.connection.getTokenAccountBalance(
      takerUsdtAta
    );

    console.log(
      "Maker USDC balance:",
      String(makerUsdcBalance.value.uiAmount || "0")
    );
    console.log(
      "Taker USDT balance:",
      String(takerUsdtBalance.value.uiAmount || "0")
    );

    assert.equal(
      parseFloat(String(makerUsdcBalance.value.uiAmount || "0")),
      10,
      "Maker should have 10 USDC"
    );
    assert.equal(
      parseFloat(String(takerUsdtBalance.value.uiAmount || "0")),
      10,
      "Taker should have 10 USDT"
    );
  });

  it("3. Create user for maker", async () => {
    // Derive user PDA
    [userPda, userBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), maker.publicKey.toBuffer()],
      program.programId
    );

    console.log("User PDA:", userPda.toBase58());

    // Call create_user instruction
    const tx = await program.methods
      .createUser()
      .accounts({
        maker: maker.publicKey,
        user: userPda,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([maker])
      .rpc();

    console.log("Create user transaction:", tx);

    // Verify user account was created
    const userAccount = await program.account.user.fetch(userPda);
    assert.equal(
      userAccount.maker.toString(),
      maker.publicKey.toString(),
      "User maker should match"
    );
    assert.equal(
      userAccount.escrowCountSeed.toNumber(),
      1,
      "Escrow count seed should start at 1"
    );
  });

  it("4. Create escrow 1: USDC 1 to USDT 5 with 3000 seconds deadline", async () => {
    // Derive escrow PDA (escrow_seed = 1)
    [escrow1Pda, escrow1Bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("es"),
        maker.publicKey.toBuffer(),
        Buffer.from([1, 0, 0, 0, 0, 0, 0, 0]),
      ],
      program.programId
    );

    console.log("Escrow 1 PDA:", escrow1Pda.toBase58());

    // Call create_escrow instruction
    const tx = await program.methods
      .createEscrow(
        new anchor.BN(TOKEN_AMOUNT_1),
        new anchor.BN(TOKEN_AMOUNT_5),
        3000
      )
      .accounts({
        maker: maker.publicKey,
        user: userPda,
        escrow: escrow1Pda,
        tokenA: usdcMint,
        tokenB: usdtMint,
        makerAtaA: makerUsdcAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([maker])
      .rpc();

    console.log("Create escrow 1 transaction:", tx);

    // Verify escrow was created correctly
    const escrowAccount = await program.account.escrow.fetch(escrow1Pda);
    assert.equal(
      escrowAccount.maker.toString(),
      maker.publicKey.toString(),
      "Escrow maker should match"
    );
    assert.equal(
      escrowAccount.tokenA.toString(),
      usdcMint.toString(),
      "Token A should be USDC"
    );
    assert.equal(
      escrowAccount.tokenB.toString(),
      usdtMint.toString(),
      "Token B should be USDT"
    );
    assert.equal(
      escrowAccount.depositTokenA.toNumber(),
      TOKEN_AMOUNT_1,
      "Deposit token A should be 1 USDC"
    );
    assert.equal(
      escrowAccount.targetB.toNumber(),
      TOKEN_AMOUNT_5,
      "Target B should be 5 USDT"
    );

    // Verify maker's USDC balance decreased
    const makerUsdcBalance = await provider.connection.getTokenAccountBalance(
      makerUsdcAta
    );
    assert.equal(
      parseFloat(String(makerUsdcBalance.value.uiAmount || "0")),
      9,
      "Maker should have 9 USDC left (10 - 1)"
    );
  });

  it("5. Create escrow 2: USDC 1 to USDT 2 with 3 seconds deadline", async () => {
    // Derive escrow PDA (escrow_seed = 2)
    [escrow2Pda, escrow2Bump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("es"),
        maker.publicKey.toBuffer(),
        Buffer.from([2, 0, 0, 0, 0, 0, 0, 0]),
      ],
      program.programId
    );

    console.log("Escrow 2 PDA:", escrow2Pda.toBase58());

    // Call create_escrow instruction
    const tx = await program.methods
      .createEscrow(
        new anchor.BN(TOKEN_AMOUNT_1),
        new anchor.BN(TOKEN_AMOUNT_2),
        3
      )
      .accounts({
        maker: maker.publicKey,
        user: userPda,
        escrow: escrow2Pda,
        tokenA: usdcMint,
        tokenB: usdtMint,
        makerAtaA: makerUsdcAta,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .signers([maker])
      .rpc();

    console.log("Create escrow 2 transaction:", tx);

    // Verify escrow was created correctly
    const escrowAccount = await program.account.escrow.fetch(escrow2Pda);
    assert.equal(
      escrowAccount.maker.toString(),
      maker.publicKey.toString(),
      "Escrow maker should match"
    );
    assert.equal(
      escrowAccount.tokenA.toString(),
      usdcMint.toString(),
      "Token A should be USDC"
    );
    assert.equal(
      escrowAccount.tokenB.toString(),
      usdtMint.toString(),
      "Token B should be USDT"
    );
    assert.equal(
      escrowAccount.depositTokenA.toNumber(),
      TOKEN_AMOUNT_1,
      "Deposit token A should be 1 USDC"
    );
    assert.equal(
      escrowAccount.targetB.toNumber(),
      TOKEN_AMOUNT_2,
      "Target B should be 2 USDT"
    );

    // Verify maker's USDC balance decreased again
    const makerUsdcBalance = await provider.connection.getTokenAccountBalance(
      makerUsdcAta
    );
    assert.equal(
      parseFloat(String(makerUsdcBalance.value.uiAmount || "0")),
      8,
      "Maker should have 8 USDC left (10 - 1 - 1)"
    );
  });

  it("6. Deal escrow 1: Exchange 1 USDC for 5 USDT", async () => {
    // Get maker's USDT ATA (it may not exist yet)
    const makerUsdtAtaAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      maker,
      usdtMint,
      maker.publicKey
    );
    makerUsdtAta = makerUsdtAtaAccount.address;

    // Record initial balances
    const takerUsdtBefore = await provider.connection.getTokenAccountBalance(
      takerUsdtAta
    );
    const takerUsdcBefore = await provider.connection.getTokenAccountBalance(
      takerUsdcAta
    );
    const makerUsdtBefore = await provider.connection.getTokenAccountBalance(
      makerUsdtAta
    );

    console.log(
      "Before deal - Taker USDT:",
      String(takerUsdtBefore.value.uiAmount || "0")
    );
    console.log(
      "Before deal - Taker USDC:",
      String(takerUsdcBefore.value.uiAmount || "0")
    );
    console.log(
      "Before deal - Maker USDT:",
      String(makerUsdtBefore.value.uiAmount || "0")
    );

    // Derive vault ATA address for escrow 1
    escrow1Vault = await getAssociatedTokenAddress(
      usdcMint,
      escrow1Pda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Call deal_token instruction
    const tx = await program.methods
      .dealToken(new anchor.BN(TOKEN_AMOUNT_5))
      .accounts({
        taker: taker.publicKey,
        escrow: escrow1Pda,
        maker: maker.publicKey,
        tokenA: usdcMint,
        makerAtaA: makerUsdcAta,
        takerAtaA: takerUsdcAta,
        tokenB: usdtMint,
        takerAtaB: takerUsdtAta,
        makerAtaB: makerUsdtAta,
        vault: escrow1Vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([taker])
      .rpc();

    console.log("Deal escrow 1 transaction:", tx);

    // Verify balances after deal
    const takerUsdtAfter = await provider.connection.getTokenAccountBalance(
      takerUsdtAta
    );
    const takerUsdcAfter = await provider.connection.getTokenAccountBalance(
      takerUsdcAta
    );
    const makerUsdtAfter = await provider.connection.getTokenAccountBalance(
      makerUsdtAta
    );

    console.log(
      "After deal - Taker USDT:",
      String(takerUsdtAfter.value.uiAmount || "0")
    );
    console.log(
      "After deal - Taker USDC:",
      String(takerUsdcAfter.value.uiAmount || "0")
    );
    console.log(
      "After deal - Maker USDT:",
      String(makerUsdtAfter.value.uiAmount || "0")
    );

    // Taker should have 5 less USDT (10 - 5 = 5)
    assert.equal(
      parseFloat(String(takerUsdtAfter.value.uiAmount || "0")),
      5,
      "Taker should have 5 USDT left after deal"
    );
    // Taker should now have 1 USDC
    assert.equal(
      parseFloat(String(takerUsdcAfter.value.uiAmount || "0")),
      1,
      "Taker should have 1 USDC after deal"
    );
    // Maker should now have 5 USDT
    assert.equal(
      parseFloat(String(makerUsdtAfter.value.uiAmount || "0")),
      5,
      "Maker should have 5 USDT after deal"
    );

    // Verify escrow account was closed
    try {
      await program.account.escrow.fetch(escrow1Pda);
      assert.fail("Escrow account should be closed");
    } catch (error) {
      assert.include(
        (error as Error).toString(),
        "Account does not exist",
        "Escrow should be closed"
      );
    }
  });

  it("7. Wait for escrow 2 to expire and then refund", async () => {
    console.log(
      "Waiting 4 seconds for escrow 2 to expire (deadline was 3 seconds)..."
    );
    await new Promise((resolve) => setTimeout(resolve, 4000));
    console.log("Escrow 2 should now be expired");

    // Get maker's USDC ATA balance before refund
    const makerUsdcBefore = await provider.connection.getTokenAccountBalance(
      makerUsdcAta
    );
    console.log(
      "Before refund - Maker USDC:",
      String(makerUsdcBefore.value.uiAmount || "0")
    );

    // Derive vault ATA address for escrow 2
    escrow2Vault = await getAssociatedTokenAddress(
      usdcMint,
      escrow2Pda,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    // Call refund instruction
    const tx = await program.methods
      .refund()
      .accounts({
        maker: maker.publicKey,
        escrow: escrow2Pda,
        tokenA: usdcMint,
        tokenAtaA: makerUsdcAta,
        vault: escrow2Vault,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([maker])
      .rpc();

    console.log("Refund escrow 2 transaction:", tx);

    // Verify balances after refund
    const makerUsdcAfter = await provider.connection.getTokenAccountBalance(
      makerUsdcAta
    );
    console.log(
      "After refund - Maker USDC:",
      String(makerUsdcAfter.value.uiAmount || "0")
    );

    // Maker should get back the 1 USDC (8 + 1 = 9)
    assert.equal(
      parseFloat(String(makerUsdcAfter.value.uiAmount || "0")),
      9,
      "Maker should have 9 USDC after refund"
    );

    // Verify escrow account was closed
    try {
      await program.account.escrow.fetch(escrow2Pda);
      assert.fail("Escrow account should be closed");
    } catch (error) {
      assert.include(
        (error as Error).toString(),
        "Account does not exist",
        "Escrow should be closed"
      );
    }
  });
});
