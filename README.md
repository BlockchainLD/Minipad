# Minipad

A **Farcaster mini app** for submitting, remixing, and building miniapp ideas — powered by Base and Convex.

## Features

- **Idea Submission** — share miniapp ideas with the community
- **Upvoting** — community-driven idea ranking
- **Remixes** — additions, edits, and comments on ideas
- **Builder Claiming** — developers claim ideas to build
- **Completion Tracking** — mark claimed ideas as complete with deployment links
- **Leaderboard** — top contributors ranked by activity
- **Farcaster Integration** — profile data, avatars, and mini app auto-connect
- **Mobile Optimized** — responsive design for Farcaster mini app context
- **EAS Integration** — Ethereum Attestation Service on Base (see [EAS Integration](#eas-integration))

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Convex (real-time database, serverless functions)
- **Authentication**: Better Auth with SIWE (Sign-In with Ethereum)
- **Blockchain**: Base Network, EAS (Ethereum Attestation Service)
- **Wallet**: Wagmi, Base Account UI
- **Icons**: Iconoir React

## Quick Start

### Prerequisites
- Node.js 18+ or Bun
- Convex account (for backend)
- Vercel account (for deployment)

### Installation
```bash
git clone https://github.com/BlockchainLD/Minipad.git
cd Minipad
bun install
bun run dev
```

### Environment Variables
Create `.env.local` from the provided example:
```bash
cp .env.example .env.local
```

Required variables:
```bash
BETTER_AUTH_SECRET=       # Generate with: bunx @better-auth/cli@latest secret
SITE_URL=http://localhost:3000
CONVEX_DEPLOYMENT=        # Your Convex deployment identifier
NEXT_PUBLIC_CONVEX_URL=   # Your Convex cloud URL
CONVEX_SITE_URL=          # Your Convex site URL (used by auth)
```

## Architecture

### Project Structure
```
app/
├── page.tsx                    # Entry point — auto-connect wrapper + main app
├── layout.tsx                  # Root layout with providers
├── icon.png                    # Favicon (Next.js convention)
├── globals.css                 # Tailwind + brand color tokens
├── .well-known/
│   └── farcaster.json/route.ts # Farcaster manifest
├── components/
│   ├── auto-connect-wrapper.tsx  # Farcaster mini app auto-connect
│   ├── ideas-board.tsx           # Main ideas list with filters
│   ├── idea-detail-modal.tsx     # Idea detail view + remixes + endorsements
│   ├── idea-submission-form.tsx  # New idea form
│   ├── idea-submission-confirmation.tsx
│   ├── claim-confirmation.tsx    # Post-claim CTA screen
│   ├── completion-form.tsx       # Mark idea as complete
│   ├── remix-form.tsx            # Create remix/comment
│   ├── leaderboard-modal.tsx     # Top contributors
│   ├── user-profile-modal.tsx    # User profile view
│   ├── farcaster-profile.tsx     # Farcaster profile display
│   ├── error-boundary.tsx        # React error boundary
│   ├── ui/                       # Reusable UI primitives
│   │   ├── idea-tile.tsx
│   │   ├── standard-button.tsx
│   │   ├── status-badge.tsx
│   │   └── user-avatar.tsx
│   └── logged-in/                # Authenticated app shell
│       ├── index.tsx             # Tab routing (home/settings)
│       ├── header.tsx
│       ├── settings-content.tsx
│       └── use-logged-in.tsx     # Shared state hook
├── hooks/
│   ├── use-farcaster-data.tsx    # Farcaster user data hook
│   └── use-is-mobile.tsx         # Responsive breakpoint hook
├── lib/
│   ├── constants.ts              # App-wide constants
│   ├── eas.ts                    # EAS hook and attestation functions
│   ├── empty.ts                  # Stub for browser-incompatible packages
│   ├── error-handler.ts          # Centralized error handling
│   ├── status-utils.ts           # Idea status display config
│   ├── types.ts                  # Shared TypeScript types
│   └── utils.ts                  # App metadata and helpers
├── providers/
│   ├── convex-client-provider.tsx
│   └── wagmi-provider.tsx
└── api/
    ├── auth/[...all]/route.ts    # Better Auth proxy (currently inert)
    └── farcaster/[fid]/route.ts  # Farcaster profile proxy

convex/
├── schema.ts         # Database schema (7 tables)
├── convex.config.ts  # App config (Better Auth component)
├── constants.ts      # Server-side constants (mirrors app/lib/constants.ts)
├── ideas.ts          # Idea queries and mutations
├── claims.ts         # Claim/unclaim/complete/edit mutations
├── remixes.ts        # Remix CRUD + upvotes
├── upvotes.ts        # Idea upvoting
├── userIdeas.ts      # Per-user idea queries
├── users.ts          # User profile (tagline)
├── endorsements.ts   # Build endorsements + leaderboard
├── seed.ts           # Admin-only seed mutation
├── types.ts          # Convex validator types (currently unused)
├── auth.ts           # Better Auth server config (no provider active)
├── auth.config.ts    # Auth provider config
├── http.ts           # HTTP routes
└── betterAuth/       # Better Auth component (auto-configured)
    ├── adapter.ts
    ├── auth.ts
    ├── convex.config.ts
    └── schema.ts

scripts/              # EAS setup, fee resolver deploy, seed (see EAS section)
contracts/            # MinipadFeeResolver Solidity source
```

### Database Schema

Seven tables in Convex:

| Table | Purpose |
|---|---|
| `ideas` | Ideas with status tracking, author info, and claim data |
| `remixes` | Comments, additions, and edits attached to ideas |
| `upvotes` | Idea upvotes (one per voter per idea) |
| `remixUpvotes` | Remix upvotes (one per voter per remix) |
| `users` | User profiles with wallet address and optional tagline |
| `claims` | Builder claims linking a claimer to an idea |
| `buildEndorsements` | Endorsements of completed builds (powers the leaderboard) |

### Convex API Reference

| Function | Type | Description |
|---|---|---|
| `ideas.submitIdea` | mutation | Submit a new idea |
| `ideas.getIdeas` | query | List ideas (most-recent, capped) |
| `ideas.deleteIdea` | mutation | Delete own idea (only while open) |
| `ideas.updateIdeaAttestation` | mutation | Store EAS attestation UID on an idea |
| `ideas.adminDeleteAllIdeas` | mutation | Wipe all ideas (admin only) |
| `claims.claimIdea` | mutation | Claim an idea to build |
| `claims.unclaimIdea` | mutation | Release a claim |
| `claims.completeIdea` | mutation | Mark idea complete with URLs |
| `claims.updateBuild` | mutation | Edit a completed build's URLs |
| `remixes.createRemix` | mutation | Add a remix/comment to an idea |
| `remixes.deleteRemix` | mutation | Delete own remix |
| `remixes.updateRemixAttestation` | mutation | Store EAS attestation UID on a remix |
| `remixes.getRemixesForIdea` | query | List remixes for an idea |
| `remixes.upvoteRemix` | mutation | Upvote a remix |
| `remixes.removeRemixUpvote` | mutation | Remove upvote from a remix |
| `remixes.hasUserUpvotedRemix` | query | Check if user upvoted a remix |
| `upvotes.upvoteIdea` | mutation | Upvote an idea |
| `upvotes.removeUpvote` | mutation | Remove upvote from an idea |
| `upvotes.hasUserUpvoted` | query | Check if user upvoted an idea |
| `users.getTagline` | query | Get user's tagline by address |
| `users.setTagline` | mutation | Set user's tagline |
| `userIdeas.getUserSubmittedIdeas` | query | Get ideas by author |
| `userIdeas.getUserClaimedIdeas` | query | Get ideas claimed by user |
| `endorsements.endorseBuild` | mutation | Endorse a completed build |
| `endorsements.removeEndorsement` | mutation | Remove a build endorsement |
| `endorsements.hasUserEndorsedBuild` | query | Check if user endorsed a build |
| `endorsements.getEndorsementCount` | query | Get endorsement count for a build |
| `endorsements.getLeaderboard` | query | Top builders by endorsement count |

## EAS Integration

The app uses Ethereum Attestation Service (EAS) on Base mainnet for blockchain attestations. This integration is under active development.

### Attestation Types
1. **Idea Attestation** — created when submitting ideas
2. **Remix Attestation** — created when creating remixes
3. **Claim Attestation** — created when claiming ideas
4. **Completion Attestation** — created when marking ideas complete

### Schema Definitions
```
IDEA:              "string title, string description, string author, string authorFid, string ideaId, uint256 timestamp"
REMIX:             "string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp"
CLAIM:             "string ideaId, string claimer, string claimerFid, uint256 timestamp"
COMPLETION:        "string ideaId, string claimer, string miniappUrl, string claimerFid, uint256 timestamp"
BUILD_ENDORSEMENT: "string ideaId, string buildUrl, string endorser, string endorserFid, string builderId, uint256 timestamp"
```

### EAS Setup
```bash
bun run register-schemas   # Register schemas on Base mainnet
bun run test-eas           # Test EAS connection
```

After registration, add the schema UIDs to your `.env.local`:
```bash
NEXT_PUBLIC_IDEA_SCHEMA_UID=
NEXT_PUBLIC_REMIX_SCHEMA_UID=
NEXT_PUBLIC_CLAIM_SCHEMA_UID=
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=
NEXT_PUBLIC_BUILD_ENDORSEMENT_SCHEMA_UID=
```

### EAS Functions
- `useEAS()` — React hook for EAS initialization
- `createIdeaAttestation()` — create idea attestation
- `createRemixAttestation()` — create remix attestation
- `createClaimAttestation()` — create claim attestation
- `createCompletionAttestation()` — create completion attestation
- `createBuildEndorsementAttestation()` — create build endorsement attestation
- `revokeAttestation()` — revoke any attestation by UID

## Deployment

### Production Deployment
1. **Deploy Convex backend:**
   ```bash
   bunx convex deploy -y
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables** in the Vercel dashboard

4. **Update `SITE_URL`** with your production domain

## Development

### Key Commands
```bash
bun run dev          # Start Next.js + Convex dev servers
bun run build        # Production build
bun run start        # Start production server
bun run lint         # Run ESLint
```

### Testing
```bash
bun run build        # Build test
bun run lint         # Lint check
bunx tsc --noEmit    # Type check
```

### Manual Testing Checklist
- [ ] Idea submission and display
- [ ] Upvoting ideas and remixes
- [ ] Remix/comment creation
- [ ] Claim and unclaim flow
- [ ] Completion submission with URLs
- [ ] Mobile layout in Farcaster mini app context
- [ ] Wallet connection (Base sign-in + Farcaster auto-connect)
- [ ] Leaderboard display
- [ ] User profile modal

## Troubleshooting

| Issue | Solution |
|---|---|
| Wallet won't connect | Ensure you're on Base network. Try refreshing or reopening the mini app. |
| Convex functions failing | Check `CONVEX_DEPLOYMENT` and `NEXT_PUBLIC_CONVEX_URL` are set correctly. Run `bunx convex dev` to verify. |
| Auth not working | Verify `BETTER_AUTH_SECRET` and `CONVEX_SITE_URL` are set. Ensure Convex HTTP routes are deployed. |
| EAS attestation fails | Check network connection, verify wallet has permissions, and ensure schema UIDs are configured. |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License — see [LICENSE.md](./LICENSE.md) for details.
