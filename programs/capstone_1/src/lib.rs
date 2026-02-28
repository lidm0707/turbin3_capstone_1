pub mod instructions;
pub mod onchain_error;
pub mod state;

pub use instructions::*;
pub use onchain_error::*;
pub use state::*;

use anchor_lang::prelude::*;
declare_id!("A4L1zqBRLrnL2ma8Qxsg1WQ5gAkFxFzT6urQwiaDRhhm");

#[program]
pub mod capstone_1 {

    use super::*;

    pub fn create_user(ctx: Context<CreateUser>) -> Result<()> {
        Ok(ctx.accounts.create_user(&ctx.bumps)?)
    }

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        deposit_token_a: u64,
        target_b: u64,
        secs_deadline: u32,
    ) -> Result<()> {
        Ok(ctx
            .accounts
            .create_escrow(deposit_token_a, target_b, secs_deadline, &ctx.bumps)?)
    }

    pub fn deal_token(ctx: Context<DealToken>, deposit_token_b: u64) -> Result<()> {
        Ok(ctx.accounts.deal_token(deposit_token_b)?)
    }

    pub fn refund(ctx: Context<Refund>) -> Result<()> {
        Ok(ctx.accounts.refund()?)
    }
}
