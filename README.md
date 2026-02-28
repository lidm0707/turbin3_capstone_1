# Capstone 1 - Escrow System
`anchor test --skip-local-validator --skip-deploy`

A Solana-based escrow system for token swaps built with Anchor framework.

## Features

- Create user accounts
- Create escrow contracts for token swaps
- Deal (complete) escrow transactions
- Refund expired escrow transactions

## Prerequisites

- Solana CLI installed
- Anchor framework installed
- Yarn package manager

## Installation

```bash
npm install
```

or

```bash
yarn install
```

## Running Tests

To run the test suite on the local network (this tests locally without deploying to testnet):

```bash
anchor test
```

Or directly with yarn:

```bash
yarn run ts-mocha -p ./tsconfig.json -t 1000000 "tests/**/*.ts"
```

**Note:** The test command runs on the local Solana validator and does not deploy to testnet or mainnet. All operations are performed in a local testing environment.

## Test Coverage

The test suite includes:
1. SOL airdrops for testing
2. Token swapping (SOL to USDC and USDT)
3. User account creation
4. Escrow creation with different parameters
5. Escrow deal operations
6. Escrow refund operations
# turbin3_capstone_1
