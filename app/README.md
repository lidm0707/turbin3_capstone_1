# Matchbook - Decentralized Escrow Trading Platform

Matchbook is a decentralized escrow trading platform built on Solana that enables users to securely trade any SPL tokens through trustless escrow contracts. Create offers with custom terms, let others fulfill them, and get automatic refunds if deals aren't completed within your specified timeframe.

## Features

- 🔒 **Secure Escrow**: Funds are locked in smart contracts, released only when terms are met
- 💱 **Flexible Trading**: Trade any SPL token with custom exchange rates - no more hardcoded USDC/USDT only!
- 🌐 **Multi-Network**: Switch between Mainnet, Devnet, and Localnet with one click
- 🎯 **Smart Token Selection**: Choose tokens manually by address or select from your wallet
- ⏰ **Time Protection**: Set expiration times with automatic refunds if offers expire
- 🚀 **Fast Swaps**: Dedicated swap interface for quick trade fulfillment
- 🎨 **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS
- 🔄 **Real Blockchain Data**: All escrow offers fetched directly from the blockchain (no mock data)

## What is Matchbook?

Matchbook is a peer-to-peer trading platform that uses Solana smart contracts to create escrow transactions. Unlike traditional exchanges, Matchbook gives you complete control over:

- **Exchange Rates**: Set your own rates based on market conditions
- **Expiration Times**: Decide how long your offers remain valid
- **Counterparties**: Choose who fulfills your offers
- **Refunds**: Automatic refunds when offers expire
- **Token Freedom**: Trade ANY SPL token - no restrictions!

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed
- npm package manager
- Phantom wallet (or other Solana-compatible wallet) installed
- Access to Solana network (network selected in-app)

## Installation

1. **Navigate to the app directory:**
```bash
cd app
```

2. **Install dependencies:**
```bash
npm i
```

3. **Run the app:**
```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── app/                    # Next.js app directory (App Router)
│   ├── create/            # Create escrow page with token selector
│   ├── swap/              # Dedicated swap interface page
│   ├── escrows/           # View all escrows page with real blockchain data
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout with wallet providers and network context
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── WalletProviders.tsx  # Wallet providers with network selector
│   └── Header.tsx          # Navigation with network selector
├── lib/                   # Utility functions
│   ├── solana.ts          # Solana program interactions (real blockchain data)
│   ├── constants.ts      # App constants (PROGRAM_ID, TOKEN_PROGRAM_ID, etc.)
└── public/                # Static assets
```

## How to Use the App

### 1. Connect Your Wallet
- Click "Connect Wallet" button in the top right
- Select your Phantom wallet (or other supported wallet)
- Approve the connection

### 2. Select Network (New!)
- Click the network selector in the top right (next to wallet button)
- Choose from: Mainnet, Devnet, or Localnet
- Network preference is saved to localStorage
- **Note**: Reload the page after switching networks

### 3. Create an Escrow Offer
- Navigate to "Create Offer" page
- Choose token input mode:
  - **Manual Mode**: Type/paste any token mint address
  - **My Tokens Mode**: Select from tokens already in your wallet
- Enter the amount you want to trade
- Token metadata (name, symbol, decimals) is fetched automatically
- Select the token you want to receive (same two modes available)
- Enter the target amount
- Set expiration time (in seconds, minutes, or hours)
- Click "Create Escrow Offer"
- Confirm transaction in your wallet

### 4. Swap Tokens (New!)
- Navigate to "Swap" page
- Browse all available escrow offers
- View token metadata and exchange rates
- Click "Fulfill Offer" to complete a swap
- Receive tokens directly to your wallet!

### 5. View and Fulfill Offers
- Navigate to "View Offers" page
- Filter by: All, Active Only, or Expired Only
- Browse available escrow offers with real blockchain data
- Click "Deal" to fulfill an offer
- Confirm transaction in your wallet
- Receive tokens!

### 6. Refund Expired Offers
- Expired offers show "Refund Your Funds" button
- Click to refund your deposited tokens
- Only the original maker can refund their offers

## Network Support

The application supports three networks (selectable in the UI):

### Mainnet
- For production use
- Real tokens and transactions
- Higher gas fees

### Devnet (Default)
- For testing
- Test tokens available from faucets
- No real money involved

### Localnet
- For development and testing
- Run your own validator
- Full control over environment

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

All data is fetched directly from the blockchain - no mock data used!

## Token Support

### Any SPL Token
The app supports ANY SPL token on Solana, not just USDC/USDT:
- Manual entry of any token mint address
- Automatic metadata fetching (name, symbol, decimals)
- Select from your wallet's existing tokens

### Token Metadata
When you enter a token address, the app automatically fetches:
- **Decimals**: Number of decimal places
- **Name**: Token name (or truncated address)
- **Symbol**: Token symbol (or truncated address prefix)

## Testing

Run Anchor tests to verify the smart contract:
```bash
cd ..
anchor test
```

## Troubleshooting

### Wallet Connection Issues
- Ensure you have Phantom wallet installed
- Switch to the correct network (check network selector in app!)
- Ensure you have some SOL for transaction fees

### Transaction Failures
- Check your token balances
- Ensure you have enough SOL for fees
- Verify program ID is correct (see constants.ts)
- Check console for error messages

### Network Switching Issues
- Reload the page after changing networks
- Clear browser cache if issues persist
- Check that your wallet is on the same network

### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm i`

### Token Address Issues
- Verify you're entering a valid Solana address
- Ensure the mint account exists on the selected network
- Check that you have balance in the selected token

## Security Considerations

- Always verify transactions before signing
- Double-check token addresses and amounts
- Only use trusted wallets
- Test thoroughly on devnet before using mainnet
- Verify network before making transactions

## Recent Improvements

### v1.1.0
- ✅ Removed all mock data - now using real blockchain data
- ✅ Added network selector (Mainnet/Devnet/Localnet)
- ✅ Added token selector with Manual and Wallet dropdown modes
- ✅ Support for ANY SPL token (not just USDC/USDT)
- ✅ Added dedicated Swap page for quick trading
- ✅ Fixed Buffer writeBigUInt64LE error
- ✅ Fixed TOKEN_PROGRAM_ID import issues
- ✅ Added automatic token metadata fetching

## Future Enhancements

- [ ] Real-time escrow updates via websockets
- [ ] Price suggestions based on market rates
- [ ] Advanced filtering and sorting
- [ ] User dashboard with trading history
- [ ] Multi-wallet support
- [ ] Mobile app version
- [ ] Token approval UI for custom tokens
- [ ] Advanced charting and analytics

## License

ISC

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Solana logs in your browser console
3. Refer to the Anchor test file for examples
4. Ensure you're on the correct network

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting PRs.