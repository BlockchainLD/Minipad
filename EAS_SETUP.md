# EAS Setup Guide for Base Mainnet

This guide will help you set up Ethereum Attestation Service (EAS) on Base mainnet for the Minipad platform.

## Prerequisites

1. **Base Mainnet Wallet**: You need a wallet with some ETH on Base mainnet to pay for schema registration
2. **Private Key**: The private key of the wallet that will register the schemas

## Step 1: Get Base ETH

If you don't have ETH on Base mainnet:

1. **Bridge from Ethereum**: Use the [Base Bridge](https://bridge.base.org/) to bridge ETH from Ethereum mainnet
2. **Buy on Exchange**: Buy ETH on an exchange that supports Base mainnet withdrawals
3. **Faucet**: Use Base testnet faucets for testing (but schemas need to be registered on mainnet)

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
# Private key for schema registration (only needed for registration script)
# DO NOT commit this to version control
PRIVATE_KEY=0x_your_private_key_here

# EAS Schema UIDs (will be populated after running registration script)
NEXT_PUBLIC_IDEA_SCHEMA_UID=
NEXT_PUBLIC_REMIX_SCHEMA_UID=
NEXT_PUBLIC_CLAIM_SCHEMA_UID=
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=
```

## Step 3: Register EAS Schemas

Run the schema registration script:

```bash
npm run register-schemas
```

This script will:
1. Connect to Base mainnet
2. Register all 4 required schemas
3. Output the schema UIDs
4. Show you the environment variables to add to `.env.local`

## Step 4: Update Environment Variables

After running the registration script, copy the output schema UIDs to your `.env.local` file:

```bash
NEXT_PUBLIC_IDEA_SCHEMA_UID=0x1234567890abcdef...
NEXT_PUBLIC_REMIX_SCHEMA_UID=0xabcdef1234567890...
NEXT_PUBLIC_CLAIM_SCHEMA_UID=0x567890abcdef1234...
NEXT_PUBLIC_COMPLETION_SCHEMA_UID=0xdef1234567890abc...
```

## Step 5: Restart Development Server

Restart your development server to load the new environment variables:

```bash
npm run dev
```

## Step 6: Test the Integration

1. **Connect Wallet**: Connect your wallet to the app
2. **Submit Idea**: Try submitting an idea
3. **Check Console**: Look for EAS initialization messages
4. **Verify Attestation**: Check that the confirmation screen appears

## Troubleshooting

### Schema Registration Fails

- **Insufficient Funds**: Make sure you have enough ETH on Base mainnet
- **Network Issues**: Check your internet connection
- **Private Key**: Verify your private key is correct

### EAS Not Initializing

- **Environment Variables**: Make sure all schema UIDs are set
- **Network**: Ensure you're connected to Base mainnet
- **Wallet**: Make sure your wallet is connected

### Attestation Fails

- **Gas**: Make sure you have enough ETH for gas fees
- **Network**: Verify you're on Base mainnet
- **Wallet**: Check that your wallet is properly connected

## Production Deployment

For production deployment:

1. **Set Environment Variables**: Add the schema UIDs to your production environment
2. **Base Account**: Configure Base Account for gasless transactions
3. **Monitor**: Monitor attestation success rates

## Cost Estimation

- **Schema Registration**: ~0.001-0.01 ETH per schema (4 schemas total)
- **Attestation Creation**: ~0.0001-0.001 ETH per attestation
- **Total Setup Cost**: ~0.005-0.05 ETH (depending on gas prices)

## Security Notes

- **Never commit private keys** to version control
- **Use environment variables** for all sensitive data
- **Test on testnet first** if possible
- **Keep private keys secure** and use hardware wallets for production
