# [Capstone 1 - Solana Escrow System](https://turbin3-capstone-1.vercel.app/)

A decentralized escrow system built on Solana using the Anchor framework. This project enables users to securely swap tokens through smart contracts that lock funds until terms are met, ensuring trustless peer-to-peer trading.

## 🌟 Features

- **User Management**: Initialize user accounts on the Solana blockchain
- **Escrow Creation**: Create escrow contracts for token swaps with custom terms
- **Deal Fulfillment**: Complete escrow transactions by meeting the maker's terms
- **Refund Mechanism**: Automatically refund expired escrows to protect makers
- **Token Flexibility**: Support for any SPL token on Solana
- **Multi-Network**: Deploy to Devnet, Testnet, or Mainnet
- **Local Testing**: Run tests on local validator without deploying

## 🏗️ Architecture

This project uses the Solana blockchain and Anchor framework to implement a secure escrow system:

### Smart Contract Components

1. **User Account**: Stores user-specific escrow state and seed counters
2. **Escrow Account**: Holds escrow details including tokens, amounts, and expiration
3. **Vault**: Associated token account owned by the escrow PDA to lock deposited tokens

### Key Instructions

1. **create_user**: Initialize a user account with an escrow seed counter
2. **create_escrow**: Create a new escrow with specified parameters:
   - Token A (deposit token)
   - Token B (target token)
   - Deposit amount
   - Target amount
   - Expiration time (in seconds)
3. **deal_token**: Fulfill an escrow by providing token B to the vault
4. **refund**: Return deposited tokens to the maker after expiration

## 📋 Prerequisites

Before running this project, ensure you have:

- **Solana CLI** (v1.18+) installed
  ```bash
  sh -c "$(curl -sSfL https://release.solana.com/stable/install)"
  export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
  ```

- **Anchor Framework** (v0.30+) installed
  ```bash
  cargo install --git https://github.com/coral-xyz/anchor avm --locked --tag v0.30.1
  ```

- **Rust** (v1.70+) installed
  ```bash
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
  ```

- **Yarn** package manager (or npm)
  ```bash
  npm install -g yarn
  ```

## 📦 Installation

1. **Clone the repository**:
  ```bash
  git clone <repository-url>
  cd capstone_1
  ```

2. **Install dependencies**:
  ```bash
  yarn install
  ```
  
3. **Build the program**:
  ```bash
  anchor build
  ```

4. **Generate IDL**:
  ```bash
  anchor build --idl
  ```

## 🧪 Running Tests

### Local Validator Testing

Run tests on your local Solana validator (no deployment required):

```bash
anchor test
```

This command:
1. Starts a local Solana validator
2. Deploys the program to the local network
3. Runs the test suite
4. Closes the validator when complete

### Individual Test File

Run specific test file directly:

```bash
anchor test --skip-local-validator --skip-deploy
```

**Built with ❤️ using Anchor and Solana**
