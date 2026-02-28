use anchor_lang::prelude::*;

use crate::User;
#[derive(Accounts)]
pub struct CreateUser<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(init,
    payer = maker,
    seeds = [b"user", maker.key().as_ref()],
    bump,
    space = User::DISCRIMINATOR.len() + User::INIT_SPACE,)]
    pub user: Account<'info, User>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateUser<'info> {
    pub fn create_user(&mut self, bumps: &CreateUserBumps) -> Result<()> {
        self.user.set_inner(User {
            maker: self.maker.key(),
            escrow_count_seed: 1,
            bump: bumps.user,
        });
        Ok(())
    }
}
