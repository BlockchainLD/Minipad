# 🚀 Vercel Environment Variables for Minipad Production Deployment

## Required Environment Variables

Copy these environment variables to your Vercel project settings:

### 1. Authentication
```bash
BETTER_AUTH_SECRET=e4127eba9c389259464e9316e723f33b31b6a8ba002c11d4d48e0cd060e47dea
```

### 2. Site Configuration
```bash
SITE_URL=https://minipad.vercel.app
```
**⚠️ IMPORTANT**: Replace with your actual Vercel domain after deployment.

### 3. Convex Configuration
```bash
CONVEX_DEPLOYMENT=prod:standing-egret-76
NEXT_PUBLIC_CONVEX_URL=https://standing-egret-76.convex.cloud
CONVEX_SITE_URL=https://standing-egret-76.convex.cloud
```

### 4. EAS Configuration (Ethereum Attestation Service)
```bash
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020
```

### 5. Optional - World App ID
```bash
NEXT_PUBLIC_WORLD_APP_ID=app_123456789
```

## Deployment Steps

### Step 1: First Deployment
1. Deploy to Vercel with the environment variables above
2. Use a placeholder for `SITE_URL` initially: `https://placeholder.vercel.app`

### Step 2: Update Domain
1. After deployment, get your actual Vercel domain (e.g., `https://mini-app-template-abc123.vercel.app`)
2. Update the `SITE_URL` environment variable in Vercel
3. Redeploy

### Step 3: Update APP_METADATA (if needed)
If you need to update the `accountAssociation` in `app/lib/utils.ts`, you may need to regenerate the signature for your domain.

## Current Convex Project Details
- **Team**: ldeangelo7
- **Project**: mini-app-template-20bca
- **Deployment**: striped-dolphin-138
- **URL**: https://striped-dolphin-138.convex.cloud

## Features Ready for Production
✅ Wallet Connection (Base Account)
✅ Auto-Connect (Base App & Farcaster)
✅ Farcaster Profile Integration
✅ Base Pay Integration
✅ Convex Authentication
✅ Responsive Design
✅ Better Auth Integration
✅ Idea Submission with EAS Attestations
✅ Upvoting System with Blockchain Attestations
✅ Builder Claiming System
✅ Remix/Expansion Feature
✅ Completion Workflow

## Testing
After deployment, test the following:
1. Wallet connection in web browser
2. Auto-connect in Base App
3. Auto-connect in Farcaster
4. Submit a new miniapp idea
5. Upvote ideas
6. Claim ideas as a builder
7. Create remixes of existing ideas
8. Mark ideas as complete
9. View completed miniapps
