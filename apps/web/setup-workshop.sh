#!/bin/bash
# 🚀 Quick Start Script - Generative Designer Frontend Setup

echo "🎨 Generative Designer v2.0 Frontend Setup"
echo "==========================================="
echo ""

# Check Node version
NODE_VERSION=$(node -v)
echo "✅ Node version: $NODE_VERSION"

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "✅ pnpm version: $PNPM_VERSION"
else
    echo "❌ pnpm not found. Installing..."
    npm install -g pnpm
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "⚙️  Checking environment variables..."

if [ ! -f "apps/web/.env.local" ]; then
    echo "📝 Creating .env.local..."
    cat > "apps/web/.env.local" << EOF
# Generative Designer API
NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL=http://localhost:8000/api/generative-designer

# Supabase (leave as is if using MakerKit default)
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
EOF
    echo "✅ .env.local created"
    echo ""
    echo "⚠️  UPDATE apps/web/.env.local with your API URL!"
else
    echo "✅ .env.local already exists"
fi

echo ""
echo "🎯 Setup Complete!"
echo ""
echo "📍 Next steps:"
echo "1. Update NEXT_PUBLIC_GENERATIVE_DESIGNER_API_URL in apps/web/.env.local"
echo "2. Run: pnpm dev"
echo "3. Open: http://localhost:3000/home/designer/workshops"
echo ""
echo "📚 Documentation:"
echo "   - WORKSHOP_FRONTEND_GUIDE.md - Complete guide"
echo "   - WORKSHOP_INTEGRATION.md - Backend integration"
echo "   - DELIVERABLES.md - What's included"
echo ""
