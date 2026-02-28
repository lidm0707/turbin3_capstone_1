use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::{
    state::{Escrow, User},
    MyError,
};
#[derive(Accounts)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mut,
           seeds = [b"user", maker.key().as_ref()],
           bump = user.bump
        )]
    pub user: Account<'info, User>,
    #[account(init,
    payer = maker,
    seeds = [b"es", maker.key().as_ref(),user.escrow_count_seed.to_le_bytes().as_ref()],
    bump,
    space = Escrow::DISCRIMINATOR.len() + Escrow::INIT_SPACE,)]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mint::token_program = token_program
    )]
    pub token_a: InterfaceAccount<'info, Mint>,
    #[account(
        mint::token_program = token_program
    )]
    pub token_b: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = token_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = token_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    //vault.owner = escrow PDA
    // ata of program sperate by PDA
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl<'info> CreateEscrow<'info> {
    pub fn create_escrow(
        &mut self,
        deposit_token_a: u64,
        target_b: u64,
        secs_deadline: u32,
        bumps: &CreateEscrowBumps,
    ) -> Result<()> {
        require!(deposit_token_a > 0, MyError::InvalidAmount);
        require!(target_b > 0, MyError::InvalidAmount);
        require!(
            self.token_a.key() != self.token_b.key(),
            MyError::InvalidPair
        );
        let clock = Clock::get()?;
        let time_plus = secs_deadline as i64;
        self.escrow.set_inner(Escrow {
            maker: self.maker.key(),
            token_a: self.token_a.key(),
            token_b: self.token_b.key(),
            deposit_token_a,
            target_b: target_b,
            bump: bumps.escrow,
            escrow_seed: self.user.escrow_count_seed,
            deadline: clock.unix_timestamp + time_plus,
        });

        let tranfer_accounts = TransferChecked {
            from: self.maker_ata_a.to_account_info(),
            mint: self.token_a.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(self.token_program.to_account_info(), tranfer_accounts);
        transfer_checked(cpi_ctx, deposit_token_a, self.token_a.decimals)?;
        self.user.escrow_count_seed += 1;
        Ok(())
    }
}
