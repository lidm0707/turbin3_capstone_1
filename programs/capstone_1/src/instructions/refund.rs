use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        close_account, transfer_checked, CloseAccount, Mint, TokenAccount, TokenInterface,
        TransferChecked,
    },
};

use crate::{Escrow, MyError};

#[derive(Accounts)]
pub struct Refund<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(mut,
            close = maker,
            has_one = maker,
            has_one = token_a,
           seeds = [b"es", maker.key().as_ref(), escrow.escrow_seed.to_le_bytes().as_ref()],
           bump)]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mint::token_program = token_program
    )]
    pub token_a: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = token_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub token_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = token_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    // Vault containing token A, owned by the escrow PDA
    pub vault: InterfaceAccount<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
}

impl Refund<'_> {
    pub fn refund(&mut self) -> Result<()> {
        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= self.escrow.deadline,
            MyError::EscrowNotExpired
        );
        require!(
            self.vault.amount == self.escrow.deposit_token_a,
            MyError::VaultMismatch
        );
        // Transfer token A from vault back to maker
        let transfer_accounts_a = TransferChecked {
            from: self.vault.to_account_info(),
            mint: self.token_a.to_account_info(),
            to: self.token_ata_a.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let maker_key = self.maker.key();
        let escrow_seed_bytes = self.escrow.escrow_seed.to_le_bytes();

        let escrow_seeds: &[&[u8]] = &[
            b"es",
            maker_key.as_ref(),
            &escrow_seed_bytes,
            &[self.escrow.bump],
        ];
        let signer_seeds = &[escrow_seeds];

        let cpi_ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            transfer_accounts_a,
            signer_seeds,
        );
        transfer_checked(cpi_ctx, self.escrow.deposit_token_a, self.token_a.decimals)?;

        self.vault.reload()?;
        require!(self.vault.amount == 0, MyError::VaultNotEmpty);

        let accounts = CloseAccount {
            account: self.vault.to_account_info(),
            destination: self.maker.to_account_info(),
            authority: self.escrow.to_account_info(),
        };

        let ctx = CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            accounts,
            signer_seeds,
        );

        close_account(ctx)?;
        Ok(())
    }
}
