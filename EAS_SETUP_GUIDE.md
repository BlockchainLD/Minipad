# 🔗 EAS Setup Guide

This guide will help you set up Ethereum Attestation Service (EAS) on Base mainnet for full blockchain attestation support.

## 🚀 Quick Setup

### Prerequisites
- Base mainnet wallet with ETH (for schema registration)
- Private key for the wallet

### One-Command Setup
```bash
# Set your private key
export PRIVATE_KEY=0x_your_private_key_here

# Run the setup script
npm run setup-eas
```

The script will:
1. ✅ Verify your private key is set
2. ✅ Check for .env.local file
3. 🚀 Register all EAS schemas
4. 📋 Show you the schema UIDs to add to .env.local

### Manual Setup

If you prefer to do it manually:

```bash
# 1. Set your private key
export PRIVATE_KEY=0x_your_private_key_here

# 2. Register schemas
npm run register-schemas

# 3. Add the output schema UIDs to .env.local
NEXT_PUBLIC_IDEA_SCHEMA_UID=0x...
NEXT_PUBLIC_REMIX_SCHEMA_UID=0x...
NEXT_PUBLIC_CLAIM_SCHEMA_UID=0x...
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=0x...

# 4. Restart your dev server
npm run dev
```

## 💰 Cost

Schema registration costs approximately **0.001-0.002 ETH** per schema (4 schemas total).

## 🔧 What Gets Registered

The following schemas will be registered on Base mainnet:

1. **IDEA Schema**: For idea submissions
2. **REMIX Schema**: For idea remixes  
3. **CLAIM Schema**: For idea claims
4. **COMPLETION Schema**: For idea completions

## 🎯 After Setup

Once schemas are registered and environment variables are set:

- ✅ All idea submissions will be attested to blockchain
- ✅ All remixes will be attested to blockchain  
- ✅ All claims will be attested to blockchain
- ✅ All completions will be attested to blockchain
- ✅ Attestations can be revoked when ideas are deleted/unclaimed

## 🚨 Troubleshooting

### "EAS schemas not configured" Error
- Make sure you've added the schema UIDs to `.env.local`
- Restart your development server after adding the UIDs

### "Insufficient funds" Error
- Bridge more ETH to Base mainnet: https://bridge.base.org/
- You need ~0.01 ETH for schema registration

### "Invalid private key" Error
- Make sure your private key starts with `0x`
- Ensure the wallet has ETH on Base mainnet

## 🔍 Verification

Test your EAS setup:
```bash
npm run test-eas
```

This will verify that:
- ✅ You're connected to Base mainnet
- ✅ EAS contract is accessible
- ✅ Schema registry is working
- ✅ All schemas are properly configured

## 📚 More Information

- [EAS Documentation](https://docs.attest.sh/)
- [Base Network](https://base.org/)
- [Base Bridge](https://bridge.base.org/)
