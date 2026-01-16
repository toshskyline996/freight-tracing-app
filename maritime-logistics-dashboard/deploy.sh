#!/bin/bash

# Maritime Logistics Dashboard - Quick Deploy Script
# Usage: ./deploy.sh

set -e

echo "🚢 Maritime Logistics Dashboard - Deployment Script"
echo "=================================================="
echo ""

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Build production version
echo "📦 Building production version..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist/ directory not found after build."
    exit 1
fi

echo "📊 Build statistics:"
du -sh dist/
echo ""

# Validate Caddyfile
echo "🔍 Validating Caddyfile..."
if command -v caddy &> /dev/null; then
    caddy validate --config ./Caddyfile
    if [ $? -eq 0 ]; then
        echo "✅ Caddyfile is valid!"
    else
        echo "⚠️  Caddyfile validation failed. Please check configuration."
        exit 1
    fi
else
    echo "⚠️  Caddy not found. Skipping validation."
fi

echo ""
echo "🎉 Deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Review Caddyfile configuration (especially basicauth password)"
echo "2. Ensure DNS is pointed to your server"
echo "3. Start Caddy: sudo systemctl start caddy"
echo "4. Or reload: sudo systemctl reload caddy"
echo ""
echo "📍 Production URL: https://freightracing.ca"
echo ""
