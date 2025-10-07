#!/bin/bash

echo "🚀 Deploying Minipad to Vercel..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the project root directory"
    exit 1
fi

# Deploy to Convex production
echo "📦 Deploying to Convex production..."
bunx convex deploy -y

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo ""
echo "📱 Next steps:"
echo "1. Update SITE_URL environment variable in Vercel with your actual domain"
echo "2. Test the app on mobile devices"
echo "3. Share the link for testing"
echo ""
echo "🔗 Your app will be available at: https://your-app-name.vercel.app"
