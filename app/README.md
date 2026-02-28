# Matchbook - Decentralized Escrow Trading Platform

Matchbook is a decentralized escrow trading platform built on Solana that enables users to securely trade USDC and USDT tokens through trustless escrow contracts. Create offers with custom terms, let others fulfill them, and get automatic refunds if deals aren't completed within your specified timeframe.

## Features

- 🔒 **Secure Escrow**: Funds are locked in smart contracts, released only when terms are met
- 💱 **Flexible Trading**: Trade USDC for USDT or vice versa with custom exchange rates
- ⏰ **Time Protection**: Set expiration times with automatic refunds if offers expire
- 🌐 **Decentralized**: Built on Solana for fast, low-cost transactions
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## What is Matchbook?

Matchbook is a peer-to-peer trading platform that uses Solana smart contracts to create escrow transactions. Unlike traditional exchanges, Matchbook gives you complete control over:

- **Exchange Rates**: Set your own rates based on market conditions
- **Expiration Times**: Decide how long your offers remain valid
- **Counterparties**: Choose who fulfills your offers
- **Refunds**: Automatic refunds when offers expire

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- npm package manager
- Phantom wallet (or other Solana-compatible wallet) installed
- Access to Solana Devnet (for testing) or Mainnet (for production)

## Installation

1. **Navigate to the app directory:**
```bash
cd app
```

2. **Install dependencies:**
```bash
npm i
```

3. **Set up environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=A4L1zqBRLrnL2ma8Qxsg1WQ5gAkFxFzT6urQwiaDRhhm
NEXT_PUBLIC_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
NEXT_PUBLIC_USDT_MINT=Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB
```

## Running the App

### Development Mode
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
npm start
```

## Project Structure

```
app/
├── app/                    # Next.js app directory (App Router)
│   ├── create/            # Create escrow page
│   ├── escrows/           # View all escrows page
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with wallet providers
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── lib/                   # Utility functions
│   ├── solana.ts          # Solana program interactions
│   └── constants.ts      # App constants
├── public/                # Static assets
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS configuration
└── package.json           # Dependencies and scripts
```

## How to Use the App

### 1. Connect Your Wallet
- Click the "Connect Wallet" button in the top right
- Select your Phantom wallet (or other supported wallet)
- Approve the connection

### 2. Create an Escrow Offer
- Navigate to the "Create Offer" page
- Select the token you want to offer (USDC or USDT)
- Enter the amount you want to trade
- Select the token you want to receive
- Enter the target amount
- Set the expiration time (in seconds, minutes, or hours)
- Click "Create Escrow Offer"
- Confirm the transaction in your wallet

### 3. View and Fulfill Offers
- Navigate to the "View Offers" page
- Browse available escrow offers
- Click "Deal" to fulfill an offer
- Confirm the transaction in your wallet
- Receive the tokens!

### 4. Refund Expired Offers
- Expired offers show "Refund Your Funds" button
- Click to refund your deposited tokens
- Only the original maker can refund

## Smart Contract Integration

This app integrates with the Matchbook Solana program located at:
```
programs/capstone_1/src/lib.rs
```

The program provides four main instructions:
1. **create_user**: Initialize user account
2. **create_escrow**: Create a new escrow offer
3. **deal_token**: Fulfill an escrow offer
4. **refund**: Refund from expired escrow

## Token Addresses

### Devnet (Default)
- **USDC**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **USDT**: `Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB`

### Mainnet (For Production)
Update the mint addresses in `.env.local` to use mainnet addresses.

## Testing

Run the Anchor tests to verify the smart contract:
```bash
cd ..
anchor test
```

## Troubleshooting

### Wallet Connection Issues
- Ensure you have the Phantom wallet installed
- Switch to Devnet in your wallet settings
- Ensure you have some SOL for transaction fees

### Transaction Failures
- Check your token balances
- Ensure you have enough SOL for fees
- Verify the program ID is correct
- Check the console for error messages

### Build Errors
- Clear the Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm i`

## Security Considerations

- Always verify transactions before signing
- Double-check token addresses and amounts
- Only use trusted wallets
- Test thoroughly on devnet before using mainnet

## Future Enhancements

- [ ] Real-time escrow updates via websockets
- [ ] Price suggestions based on market rates
- [ ] Advanced filtering and sorting
- [ ] User dashboard with history
- [ ] Multi-wallet support
- [ ] Mobile app version

## License

ISC

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the Solana logs in your browser console
3. Refer to the Anchor test file for examples

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs.