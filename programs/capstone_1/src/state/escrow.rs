use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Escrow {
    pub maker: Pubkey,
    pub token_a: Pubkey,
    pub token_b: Pubkey,
    pub deposit_token_a: u64,
    pub target_b: u64, //1.5 * 10^6 = 1_500_000
    pub escrow_seed: u64,
    pub bump: u8,
    pub deadline: i64,
}
