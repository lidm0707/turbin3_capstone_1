use anchor_lang::prelude::*;

#[error_code]
pub enum MyError {
    #[msg("Escrow has expired")]
    EscrowExpired,

    #[msg("Escrow not expired yet")]
    EscrowNotExpired,

    #[msg("Overflow occurred")]
    Overflow,

    #[msg("Insufficient balance")]
    InsufficientBalance,

    #[msg("Vault is not empty")]
    VaultNotEmpty,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Invalid pair")]
    InvalidPair,

    #[msg("Vault mismatch")]
    VaultMismatch,
}
