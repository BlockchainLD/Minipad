# EAS Integration Documentation

This document outlines the clean implementation of Ethereum Attestation Service (EAS) integration in the Minipad Ideas platform, following Base and Farcaster Mini Apps best practices.

## Overview

The EAS integration provides verifiable, on-chain attestations for key user actions in the platform, including:
- Idea submissions
- Remix creations
- Claims
- Completions

## Attestation Types

### 1. Idea Attestations
- Created when users submit new ideas
- Includes idea title, description, author, and timestamp
- Provides verifiable proof of idea ownership and submission time

### 2. Remix Attestations
- Created when users create remixes of existing ideas
- Includes remix title, description, remixer, original idea ID, and timestamp
- Provides verifiable proof of remix creation and attribution

### 3. Claim Attestations
- Created when users claim ideas for development
- Includes idea ID, claimer address, and timestamp
- Provides verifiable proof of claim ownership

### 4. Completion Attestations
- When ideas are completed, the completion is attested
- Includes idea ID, claimer, miniapp URL, and timestamp
- Provides verifiable proof of completion with the actual miniapp URL

## Technical Implementation

### EAS Configuration
- **Network**: Base Mainnet
- **EAS Contract**: `0x4200000000000000000000000000000000000021`
- **Schema Registry**: `0x4200000000000000000000000000000000000020`

### Schema Definitions
Each attestation type uses a specific schema:

1. **Idea Schema**: `string title, string description, string author, string authorFid, string ideaId, uint256 timestamp`
2. **Remix Schema**: `string title, string description, string remixer, string remixerFid, string originalIdeaId, string remixId, uint256 timestamp`
3. **Claim Schema**: `string ideaId, string claimer, string claimerFid, uint256 timestamp`
4. **Completion Schema**: `string ideaId, string claimer, string miniappUrl, string claimerFid, uint256 timestamp`

### Base/Farcaster Best Practices Implementation

#### 1. Gasless Transactions
- **Base Account Integration**: Uses Base Account for gas sponsorship
- **Paymaster Support**: Transactions are sponsored, eliminating gas fees for users
- **Seamless UX**: Users don't need to manage gas or ETH for transactions

#### 2. Clean Implementation
- **No Fallbacks**: Focused implementation without mock or offchain fallbacks
- **Proper Error Handling**: Clear error messages when EAS is not available
- **Schema Registration**: Automatic schema registration on initialization

#### 3. Batch Transactions (Future Enhancement)
- **EIP-5792 Support**: Framework for batch transactions to reduce user friction
- **Sequential Processing**: Current implementation processes attestations sequentially
- **Future Optimization**: Ready for true batch transaction implementation

### Authentication & UX
- **Seamless Authentication**: Uses connected Base App account
- **Network Validation**: Ensures users are on Base network
- **Clear Feedback**: Success messages indicate gasless transactions
- **Error Prevention**: Validates inputs and network before attempting transactions

## Key Benefits

### 1. Verifiable Actions
- All user actions are cryptographically attested
- Immutable record of idea submissions, upvotes, claims, and completions
- Transparent and auditable platform activity

### 2. Enhanced Trust
- Users can verify the authenticity of ideas and actions
- Prevents manipulation of voting or claiming systems
- Builds confidence in the platform's integrity

### 3. Future-Proof
- Attestations can be used for reputation systems
- Enables cross-platform verification
- Supports advanced features like idea provenance

### 4. Gasless Experience
- No gas fees for users thanks to Base Account integration
- Seamless onboarding and interaction
- Follows Base onchain UX best practices

## Database Schema Updates

The Convex database schema has been updated to store attestation UIDs:

```typescript
// Ideas table now includes attestation UIDs
ideas: defineTable({
  // ... existing fields ...
  attestationUid: v.optional(v.string()),
  completionAttestationUid: v.optional(v.string()),
})
```

## Error Handling

The implementation includes comprehensive error handling:

- **Network Validation**: Ensures users are connected to Base network
- **Schema Validation**: Verifies schemas are registered before use
- **Input Validation**: Validates all required fields before attestation
- **Clear Error Messages**: Users receive helpful error messages when issues occur

## Production Readiness

This implementation is production-ready with:

- ✅ **Real EAS Integration**: No mock data or fallbacks
- ✅ **Gasless Transactions**: Base Account integration for seamless UX
- ✅ **Schema Registration**: Automatic schema management
- ✅ **Error Handling**: Comprehensive validation and error messages
- ✅ **Base Network**: Optimized for Base mainnet
- ✅ **Farcaster Integration**: Works seamlessly with Farcaster Mini Apps

## Usage

The EAS integration is automatically initialized when users connect their wallet. All attestations are created transparently during normal platform usage:

1. **Submit Idea**: Automatically creates idea attestation
2. **Upvote**: Simple upvote (no EAS attestation as per requirements)
3. **Claim**: Automatically creates claim attestation
4. **Complete**: Automatically creates completion attestation
5. **Delete Idea**: Automatically revokes idea attestation
6. **Unclaim**: Revokes claim attestation (TODO: implementation pending)

Users see success messages indicating their actions have been attested to the blockchain with gasless transactions.