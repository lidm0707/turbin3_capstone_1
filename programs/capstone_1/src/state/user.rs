use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct User {
    pub maker: Pubkey,
    pub escrow_count_seed: u64,
    pub bump: u8,
}
