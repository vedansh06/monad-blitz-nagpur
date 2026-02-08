#!/bin/bash
# yarn-only.sh - Helper script to ensure yarn usage

echo "🚨 This project uses Yarn as the package manager!"
echo ""
echo "Please use these commands instead:"
echo "  yarn install    (instead of npm install)"
echo "  yarn dev        (instead of npm run dev)"
echo "  yarn build      (instead of npm run build)"
echo "  yarn add <pkg>  (instead of npm install <pkg>)"
echo ""
echo "If you don't have yarn installed:"
echo "  npm install -g yarn"
echo ""

# If package-lock.json exists, warn about it
if [ -f "package-lock.json" ]; then
    echo "⚠️  Found package-lock.json - removing it to avoid conflicts..."
    rm package-lock.json
    echo "✅ Removed package-lock.json"
fi

# If bun.lockb exists, warn about it
if [ -f "bun.lockb" ]; then
    echo "⚠️  Found bun.lockb - removing it to avoid conflicts..."
    rm bun.lockb
    echo "✅ Removed bun.lockb"
fi

echo ""
echo "Run 'yarn install' to install dependencies with yarn."