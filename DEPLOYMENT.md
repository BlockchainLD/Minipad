# 🚀 Minipad Deployment Guide

## Quick Deployment to Vercel

### Step 1: Deploy to Vercel
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Deploy with the following environment variables:

### Step 2: Environment Variables
Add these to your Vercel project settings:

```bash
# Convex Configuration
CONVEX_DEPLOYMENT=prod:standing-egret-76
NEXT_PUBLIC_CONVEX_URL=https://standing-egret-76.convex.cloud

# Authentication
BETTER_AUTH_SECRET=e4127eba9c389259464e9316e723f33b31b6a8ba002c11d4d48e0cd060e47dea

# Site Configuration (Update with your actual Vercel domain)
SITE_URL=https://your-app-name.vercel.app

# EAS Configuration
EAS_CONTRACT_ADDRESS=0x4200000000000000000000000000000000000021
SCHEMA_REGISTRY_ADDRESS=0x4200000000000000000000000000000000000020
```

### Step 3: Update Site URL
After deployment, update the `SITE_URL` environment variable with your actual Vercel domain.

### Step 4: Test on Mobile
1. Open the deployed URL on your mobile device
2. Test wallet connection
3. Submit an idea
4. Test upvoting and claiming features

## Features Ready for Testing
✅ Idea submission with blockchain attestations
✅ Upvoting system
✅ Builder claiming system
✅ Remix/expansion feature
✅ Completion workflow
✅ Mobile-optimized interface

## Mobile Testing Checklist
- [ ] Wallet connection works
- [ ] Can submit new ideas
- [ ] Can upvote ideas
- [ ] Can claim ideas as builder
- [ ] Can create remixes
- [ ] Can mark ideas as complete
- [ ] UI is responsive on mobile
- [ ] All buttons and forms work properly
