#!/bin/bash

# EAS Schema Setup Script for Minipad
# This script helps you register EAS schemas and update environment variables

echo "🔧 EAS Schema Setup for Minipad"
echo "================================"
echo ""

# Check if PRIVATE_KEY is set
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ PRIVATE_KEY environment variable is not set."
    echo ""
    echo "To set your private key, run:"
    echo "export PRIVATE_KEY=0x_your_private_key_here"
    echo ""
    echo "⚠️  Make sure you have some ETH on Base mainnet to pay for schema registration."
    echo "   You can bridge ETH from Ethereum mainnet using: https://bridge.base.org/"
    echo ""
    exit 1
fi

echo "✅ PRIVATE_KEY is set"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ .env.local file not found. Please create it first."
    echo ""
    echo "You can copy from .env.example:"
    echo "cp .env.example .env.local"
    echo ""
    exit 1
fi

echo "✅ .env.local file found"
echo ""

# Run the schema registration script
echo "🚀 Registering EAS schemas..."
echo ""

node scripts/register-eas-schemas.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Schema registration completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the schema UIDs from the output above"
    echo "2. Add them to your .env.local file:"
    echo "   NEXT_PUBLIC_IDEA_SCHEMA_UID=0x..."
    echo "   NEXT_PUBLIC_REMIX_SCHEMA_UID=0x..."
    echo "   NEXT_PUBLIC_CLAIM_SCHEMA_UID=0x..."
    echo "   NEXT_PUBLIC_COMPLETION_SCHEMA_UID=0x..."
    echo "   NEXT_PUBLIC_BUILD_ENDORSEMENT_SCHEMA_UID=0x..."
    echo ""
    echo "3. Restart your development server:"
    echo "   npm run dev"
    echo ""
    echo "🎉 Your app will now have full EAS attestation support!"
else
    echo ""
    echo "❌ Schema registration failed. Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "- Insufficient ETH balance on Base mainnet"
    echo "- Invalid private key"
    echo "- Network connectivity issues"
    echo ""
    exit 1
fi
