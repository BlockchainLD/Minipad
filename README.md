# Minipad

A **Base mini app** for submitting, remixing, and building miniapp ideas with EAS (Ethereum Attestation Service) integration.

## 🚀 Features

- **Idea Submission** with blockchain attestations
- **Remix Creation** with blockchain attestations  
- **Builder Claiming** with blockchain attestations
- **Completion Tracking** with blockchain attestations
- **Gasless Transactions** via Base Account
- **Mobile Optimized** responsive design
- **Farcaster Integration** for profile data

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Convex (database, real-time sync, serverless functions)
- **Authentication**: Better Auth with SIWE (Sign-In with Ethereum)
- **Blockchain**: Base Network, EAS (Ethereum Attestation Service)
- **UI**: Worldcoin Mini Apps UI Kit
- **Wallet**: Wagmi, Base Account integration

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Base wallet (Coinbase Wallet, MetaMask, etc.)
- Vercel account (for deployment)
- Convex account (for backend)

### Installation
```bash
git clone <repository-url>
cd Minipad
bun install
bun run dev
```

### Environment Variables
Create `.env.local` with:
```bash
# Authentication
BETTER_AUTH_SECRET=your_secret_here

# Site Configuration
SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Convex Configuration
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.cloud

# EAS Configuration (Base Mainnet)
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020

# EAS Schema UIDs (optional - will auto-register if empty)
NEXT_PUBLIC_IDEA_SCHEMA_UID=
NEXT_PUBLIC_REMIX_SCHEMA_UID=
NEXT_PUBLIC_CLAIM_SCHEMA_UID=
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=
```

## 🔗 EAS Integration

The app uses Ethereum Attestation Service (EAS) on Base mainnet for blockchain attestations. Schemas are automatically registered on first use.

### Attestation Types
1. **Idea Attestation**: Created when submitting ideas
2. **Remix Attestation**: Created when creating remixes
3. **Claim Attestation**: Created when claiming ideas
4. **Completion Attestation**: Created when marking ideas complete

### Key Features
- **Gasless Transactions**: All EAS operations are gasless via Base Account
- **Blockchain Attestations**: All actions are attested to Base mainnet
- **Attestation Revocation**: Full support for revoking attestations
- **Schema Management**: Pre-configured schemas for all operations

## 🚀 Deployment

### Production Deployment
1. **Deploy to Convex**:
   ```bash
   bunx convex deploy -y
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard

4. **Update SITE_URL** with actual domain

## 🧪 Testing

### Manual Testing Checklist
- [ ] **Idea Submission**: Submit ideas and verify blockchain attestations
- [ ] **Idea Deletion**: Delete ideas and verify attestation revocation
- [ ] **Remix Creation**: Create remixes and verify blockchain attestations
- [ ] **Claim/Unclaim**: Test claiming and unclaiming with attestations
- [ ] **Completion**: Mark ideas as complete with blockchain attestations
- [ ] **Mobile Testing**: Test on mobile devices
- [ ] **Wallet Integration**: Test Base App and Farcaster auto-connect

## 📚 Documentation

For comprehensive documentation including:
- Detailed architecture overview
- API reference
- Troubleshooting guide
- Development setup
- Contributing guidelines

See [DOCUMENTATION.md](./DOCUMENTATION.md)

## 📄 License

MIT License - see LICENSE.md for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request