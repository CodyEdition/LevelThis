#!/bin/bash
# Setup script run inside dev container
# Uses repo build script: npm run setup && npm run build:dev

set -e

echo "🚀 Setting up Vencord development environment..."

# Ensure pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "📦 Installing pnpm..."
    npm install -g pnpm
fi

# Use the project's build script (clones Vencord, copies plugin, installs, builds)
echo "📋 Running npm run setup..."
npm run setup

echo "🔨 Building Vencord (dev)..."
npm run build:dev

echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   npm run build       - Production build"
echo "   npm run build:dev   - Dev build"
echo "   npm run clean       - Remove vencord directory"
echo ""
echo "   Built files: vencord/dist/"
echo "💡 To test injection locally, copy dist/ files to your Discord installation"
