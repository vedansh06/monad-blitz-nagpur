#!/bin/bash

# MonoFi-AI Environment Setup Script
echo "🚀 Setting up MonoFi-AI Development Environment..."

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Copy .env.example to .env
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
else
    echo "❌ .env.example file not found!"
    exit 1
fi

echo ""
echo "📝 Please update the following variables in your .env file:"
echo "   - VITE_GEMINI_API_KEY: Get from https://aistudio.google.com/app/apikey"
echo "   - VITE_WALLET_CONNECT_PROJECT_ID: Get from https://cloud.walletconnect.com"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies with yarn..."
    
    # Enforce yarn usage only
    if command -v yarn &> /dev/null; then
        echo "✅ Using yarn (required for this project)..."
        yarn install
    else
        echo "❌ Yarn not found! This project requires yarn as the package manager."
        echo "💡 Install yarn first: npm install -g yarn"
        echo "   Then run this setup script again."
        exit 1
    fi
    
    echo "✅ Dependencies installed successfully with yarn!"
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "   1. Edit .env file with your API keys"
echo "   2. Run 'yarn dev' to start development server"
echo "   3. Visit http://localhost:5173 to see your app"
echo ""
echo "📚 For more information, check the README.md file"
echo "🔗 Add Monad Testnet to MetaMask:"
echo "   - Network: Monad Testnet"
echo "   - RPC URL: https://testnet-rpc.monad.xyz"
echo "   - Chain ID: 10143"
echo "   - Symbol: MON"
echo "   - Explorer: https://testnet.monadexplorer.com"