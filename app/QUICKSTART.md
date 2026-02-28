# Quick Start Guide - Matchbook App

Get your Matchbook escrow trading platform up and running in minutes!

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** 18+ installed
- **npm** package manager
- **Phantom Wallet** (or other Solana-compatible wallet) browser extension
- **Solana CLI** (optional, for advanced development)

## 🚀 Installation & Setup

### 1. Navigate to the App Directory
```bash
cd capstone_1/app
```

### 2. Install Dependencies
```bash
npm i
```

### 3. Configure Environment Variables
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your preferred configuration:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=A4L1zqBRLrnL2ma8Qxsg1WQ5gAkFxFzT6urQwiaDRhhm
```

### 4. Get Test SOL and Tokens

**Get SOL:**
- Visit [Solana Faucet](https://faucet.solana.com/)
- Connect your wallet to devnet
- Request test SOL

**Get USDC/USDT (Optional for testing):**
- The app includes mock data for testing the UI
- For real transactions, you'll need actual devnet tokens

## 🎮 Running the Application

### Development Mode
```bash
npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start

```

## 📱 Using the App

### 1. Connect Your Wallet
- Click "Connect Wallet" in the top right
- Select and authorize your Phantom wallet
- Ensure you're connected to **Devnet**

### 2. Create an Escrow Offer
- Click **"Create Offer"** in the navigation
- Select your token (USDC or USDT)
- Enter the amount to offer
- Select the target token
- Enter the amount you want to receive
- Set expiration time (seconds/minutes/hours)
- Click **"Create Escrow Offer"**
- Approve the transaction in your wallet

### 3. View and Fulfill Offers
- Click **"View Offers"** in the navigation
- Browse available escrows
- Click **"Deal"** on any active offer
- Approve the transaction
- Receive the tokens!

### 4. Refund Expired Offers
- Expired offers show **"Refund Your Funds"**
- Click to get your tokens back
- Only the original creator can refund

## 🧪 Testing the Smart Contract

Run the Anchor tests to verify the smart contract:
```bash
cd ..
anchor test
```

## 📂 Project Structure

```
app/
├── app/
│   ├── create/          # Create escrow page
│   ├── escrows/         # View all escrows page
│   ├── page.tsx         # Home page
│   └── layout.tsx       # Root layout with wallet providers
├── components/
│   ├── Header.tsx       # Navigation header
│   └── LoadingSpinner.tsx
├── lib/
│   ├── solana.ts        # Solana program interactions
│   ├── constants.ts     # App constants
│   └── utils.ts         # Utility functions
├── public/              # Static assets
└── package.json         # Dependencies
```

## 🔧 Common Issues & Solutions

### Wallet Not Connecting
- **Issue**: Wallet button doesn't work
- **Solution**: Ensure Phantom wallet is installed and unlocked
- Switch to Devnet in wallet settings

### Transaction Fails
- **Issue**: Transactions keep failing
- **Solutions**:
  - Check you have enough SOL for fees (~0.0005 SOL per transaction)
  - Verify you're on Devnet, not Mainnet
  - Check your token balances
  - Look at browser console for error messages

### Build Errors
- **Issue**: Next.js build fails
- **Solutions**:
  ```bash
  # Clear cache and reinstall
  rm -rf .next node_modules
  npm i
  npm run dev
  ```

### Can't Find Program
- **Issue**: "Account does not exist" errors
- **Solution**: Make sure your program is deployed to Devnet:
  ```bash
  anchor deploy --provider.cluster devnet
  ```

## 🎨 Customization

### Change Network
Edit `.env.local`:
```env
# For Mainnet
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Update Token Addresses
Edit `.env.local` or `lib/constants.ts`:
```env
# Update these to your actual token mint addresses
NEXT_PUBLIC_USDC_MINT=your-usdc-mint-address
NEXT_PUBLIC_USDT_MINT=your-usdt-mint-address
```

### Modify Styles
- Global styles: `app/globals.css`
- Tailwind config: `tailwind.config.ts`
- Component styles: Use Tailwind classes directly in components

## 📚 Next Steps

1. **Deploy the Program**: Deploy your Anchor program to Solana Devnet
2. **Test Transactions**: Try creating and fulfilling actual escrows
3. **Fetch Real Data**: Replace mock data with actual blockchain data
4. **Add Features**: Implement user profiles, history, analytics
5. **Deploy to Production**: Deploy frontend to Vercel/Netlify

## 🔐 Security Notes

⚠️ **Important Security Considerations**:

- **NEVER** share your private key or seed phrase
- **ALWAYS** verify transaction details before signing
- **DOUBLE-CHECK** token addresses and amounts
- **TEST** thoroughly on Devnet before using Mainnet
- **USE** hardware wallets for significant amounts

## 🆘 Need Help?

1. Check the [full README.md](./README.md) for detailed documentation
2. Review browser console for error messages
3. Check the Anchor test file for implementation examples
4. Ensure your program ID in `.env.local` matches your deployed program

## 🎉 You're Ready!

Your Matchbook escrow trading platform is now set up. Start trading USDC and USDT securely on Solana!

---

**Pro Tips** 💡:
- Keep your wallet on Devnet for testing
- Use small amounts when testing
- Clear your browser cache if you encounter issues
- Join Solana Discord for community support