# 📚 Minipad Documentation

## 🚀 Quick Start

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

# Convex Configuration
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.cloud

# EAS Configuration (Base Mainnet)
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020

# EAS Schema UIDs (auto-register if empty)
NEXT_PUBLIC_IDEA_SCHEMA_UID=
NEXT_PUBLIC_REMIX_SCHEMA_UID=
NEXT_PUBLIC_CLAIM_SCHEMA_UID=
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=
```

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Convex (database, real-time sync, serverless functions)
- **Blockchain**: Base Network, EAS (Ethereum Attestation Service)
- **Authentication**: Better Auth with SIWE (Sign-In with Ethereum)
- **UI**: Worldcoin Mini Apps UI Kit, Tailwind CSS
- **Wallet**: Wagmi, Base Account integration

### Key Features
- ✅ **Idea Submission** with EAS attestations
- ✅ **Remix Creation** with EAS attestations
- ✅ **Builder Claiming** with EAS attestations
- ✅ **Completion Tracking** with EAS attestations
- ✅ **Attestation Revocation** for deletions/unclaiming
- ✅ **Gasless Transactions** via Base Account
- ✅ **Mobile Optimized** responsive design
- ✅ **Farcaster Integration** for profile data

## 🔗 EAS Integration

### Attestation Types
1. **Idea Attestation**: Created when submitting ideas
2. **Remix Attestation**: Created when creating remixes
3. **Claim Attestation**: Created when claiming ideas
4. **Completion Attestation**: Created when marking ideas complete

### Schema Definitions
```typescript
IDEA: "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp"
REMIX: "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp"
CLAIM: "string ideaId, string claimer, string claimerFid, uint256 timestamp"
COMPLETION: "string ideaId, string claimer, string miniappUrl, string claimerFid, uint256 timestamp"
```

### Key Functions
- `createIdeaAttestation()` - Creates idea attestations
- `createRemixAttestation()` - Creates remix attestations
- `createClaimAttestation()` - Creates claim attestations
- `createCompletionAttestation()` - Creates completion attestations
- `revokeAttestation()` - Revokes any attestation

## 🗄️ Database Schema

### Tables
- **ideas**: Main ideas and remixes
- **upvotes**: User upvotes (no EAS attestations)
- **claims**: Builder claims with attestations

### Key Fields
```typescript
ideas: {
  title: string
  description: string
  author: string
  attestationUid?: string
  isRemix?: boolean
  originalIdeaId?: string
  remixAttestationUid?: string
  completionAttestationUid?: string
  // ... other fields
}
```

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

### Environment Variables for Production
```bash
# Authentication
BETTER_AUTH_SECRET=your_production_secret

# Site Configuration
SITE_URL=https://your-app.vercel.app

# Convex Configuration
CONVEX_DEPLOYMENT=prod:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_SITE_URL=https://your-deployment.convex.cloud

# EAS Configuration
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020

# EAS Schema UIDs (auto-register if empty)
NEXT_PUBLIC_IDEA_SCHEMA_UID=
NEXT_PUBLIC_REMIX_SCHEMA_UID=
NEXT_PUBLIC_CLAIM_SCHEMA_UID=
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] **Idea Submission**: Submit ideas and verify EAS attestations
- [ ] **Idea Deletion**: Delete ideas and verify attestation revocation
- [ ] **Remix Creation**: Create remixes and verify EAS attestations
- [ ] **Claim/Unclaim**: Test claiming and unclaiming with attestations
- [ ] **Completion**: Mark ideas as complete with EAS attestations
- [ ] **Mobile Testing**: Test on mobile devices
- [ ] **Wallet Integration**: Test Base App and Farcaster auto-connect

### Automated Testing
```bash
# Build test
bun run build

# Lint check
bun run lint

# Type check
bunx tsc --noEmit
```

## 🔧 Development

### Project Structure
```
app/
├── components/          # React components
├── lib/                # Utility libraries (EAS, auth, utils)
├── providers/          # React context providers
└── api/               # API routes

convex/
├── schema.ts          # Database schema
├── ideas.ts           # Idea-related functions
├── claims.ts          # Claim-related functions
├── remixes.ts         # Remix-related functions
└── upvotes.ts         # Upvote-related functions
```

### Key Commands
```bash
# Development
bun run dev            # Start development server
bunx convex dev        # Start Convex development

# Building
bun run build          # Build for production
bun run start          # Start production server

# Deployment
bunx convex deploy     # Deploy to Convex
vercel --prod          # Deploy to Vercel
```

## 🐛 Troubleshooting

### Common Issues
1. **EAS Not Initialized**: Ensure user is connected to Base network
2. **Schema Registration Failed**: Check network connection and try again
3. **Attestation Failed**: Verify wallet has sufficient permissions
4. **Revocation Failed**: Check if attestation exists and is revocable

### Debug Commands
```javascript
// Check EAS status
console.log(window.eas);

// Check wallet connection
console.log(window.ethereum);

// Check Convex connection
console.log(window.convex);
```

## 📋 API Reference

### Convex Functions
- `ideas.submitIdea()` - Submit new idea
- `ideas.deleteIdea()` - Delete idea
- `claims.claimIdea()` - Claim idea
- `claims.unclaimIdea()` - Unclaim idea
- `claims.completeIdea()` - Mark idea complete
- `remixes.createRemix()` - Create remix
- `upvotes.upvoteIdea()` - Upvote idea

### EAS Functions
- `createIdeaAttestation()` - Create idea attestation
- `createRemixAttestation()` - Create remix attestation
- `createClaimAttestation()` - Create claim attestation
- `createCompletionAttestation()` - Create completion attestation
- `revokeAttestation()` - Revoke attestation

## 📄 License

MIT License - see LICENSE.md for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review the API reference
- Open an issue on GitHub
