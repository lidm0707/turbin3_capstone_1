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
  
  Or using npm:
  ```bash
  npm install
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

## 📊 Test Coverage

The test suite includes comprehensive coverage of:

1. **Environment Setup**
   - SOL airdrops for testing
   - Token mint creation (USDC, USDT)
   - User account initialization

2. **Escrow Operations**
   - Create escrow with USDC → USDT
   - Create escrow with USDT → USDC
   - Create escrow with custom expiration times
   - Create escrow with varying amounts

3. **Deal Fulfillment**
   - Fulfill USDC → USDT escrow
   - Fulfill USDT → USDC escrow
   - Transfer tokens to taker
   - Return tokens to maker from vault

4. **Refund Operations**
   - Refund expired escrows
   - Return tokens to maker from vault
   - Verify escrow closure

5. **Error Handling**
   - Prevent dealing with own escrow
   - Prevent refunding active escrow
   - Validate token amounts
   - Enforce expiration deadlines

## 📁 Project Structure

```
capstone_1/
├── app/                    # Next.js frontend application
│   ├── app/              # Next.js App Router pages
│   │   ├── create/      # Create escrow page
│   │   ├── escrows/     # View escrows page
│   │   ├── swap/        # Swap interface page
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Home page
│   ├── components/       # Reusable React components
│   │   ├── WalletProviders.tsx  # Wallet connection & network selector
│   │   └── Header.tsx           # Navigation header
│   ├── lib/             # Utility functions
│   │   ├── solana.ts      # Solana program interactions
│   │   └── constants.ts   # App constants
│   ├── public/           # Static assets
│   ├── package.json      # Frontend dependencies
│   ├── next.config.js   # Next.js configuration
│   ├── tailwind.config.ts # Tailwind CSS config
│   ├── tsconfig.json     # TypeScript config
│   └── README.md        # Frontend documentation
│
├── programs/              # Anchor programs
│   └── capstone_1/     # Main escrow program
│       ├── Anchor.toml      # Anchor program configuration
│       ├── Cargo.toml      # Rust dependencies
│       ├── Xargo.toml      # Anchor-specific configuration
│       ├── src/            # Rust source code
│       │   ├── lib.rs      # Main program logic
│       │   └── state.rs    # State structs
│       └── tests/          # Rust tests
│           └── capstone_1.ts  # Integration tests
│
├── tests/                # TypeScript integration tests
│   └── capstone_1.ts     # Full test suite
│
├── Anchor.toml            # Anchor workspace configuration
├── Cargo.toml             # Rust workspace configuration
├── package.json            # Rust dependencies
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## 🔧 Configuration

### Anchor.toml

Configure your Solana cluster in `programs/capstone_1/Anchor.toml`:

```toml
[features]
seeds = false
skip-lint = false

[programs.localnet]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"

[programs.devnet]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"

[programs.mainnet]
cluster = "Mainnet"
wallet = "~/.config/solana/id.json"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "Localnet"
wallet = "~/.config/solana/id.json"
```

## 🚀 Deployment

### Deploy to Localnet

```bash
anchor build
anchor deploy
```

### Deploy to Devnet

```bash
anchor build
anchor deploy --provider.cluster devnet
```

### Deploy to Mainnet

```bash
anchor build
anchor deploy --provider.cluster mainnet
```

**Note**: Before deploying to mainnet, ensure you have:
- Sufficient SOL in your wallet for deployment fees
- Thoroughly tested the program on devnet
- Audited the code for security vulnerabilities
- Backed up your program authority key

## 🔐 Security Considerations

1. **Program Authority**: Ensure your program authority key is securely stored and backed up
2. **Escrow Validation**: The program validates that only the maker can refund their escrow
3. **Expiration Enforcement**: Escrows cannot be fulfilled after expiration, protecting makers
4. **Token Safety**: Tokens are locked in vault PDAs controlled by the escrow PDA
5. **PDA Derivation**: All accounts use deterministic PDA derivation for security

## 🛠️ Troubleshooting

### Build Errors

**Error**: `Error: No such file or directory (os error 2)`
- **Solution**: Ensure Solana CLI is installed and in your PATH
- **Solution**: Run `solana-keygen new` to verify installation

**Error**: `Error: Program account already in use`
- **Solution**: Run `anchor clean` before redeploying
- **Solution**: Use `anchor deploy --program-name <name>` to update existing program

### Test Failures

**Error**: `Error: Account allocation failed: max allocations reached`
- **Solution**: Restart the local validator with more resources
- **Solution**: Close other Solana processes

**Error**: `Error: Transaction simulation failed: Error processing Instruction 2: insufficient funds`
- **Solution**: Airdrop more SOL to the test wallet
- **Solution**: Mint more test tokens

### Network Issues

**Error**: `Error: Failed to send transaction: RPC error`
- **Solution**: Check that the Solana RPC endpoint is accessible
- **Solution**: Verify you're connected to the correct cluster
- **Solution**: Check your internet connection

## 📚️ Additional Resources

- [Anchor Documentation](https://www.anchor-lang.com/docs)
- [Solana Documentation](https://docs.solana.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Rust Book](https://doc.rust-lang.org/book/)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`anchor test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

ISC

## 👥 Support

For issues, questions, or contributions:

1. Check the troubleshooting section above
2. Review the test files for usage examples
3. Consult Anchor and Solana documentation
4. Open an issue on GitHub with detailed information

---

**Built with ❤️ using Anchor and Solana**
