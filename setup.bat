@echo off
REM MonoFi-AI Environment Setup Script for Windows
echo 🚀 Setting up MonoFi-AI Development Environment...

REM Check if .env file exists
if exist ".env" (
    echo ⚠️  .env file already exists. Backing up to .env.backup
    copy ".env" ".env.backup" >nul
)

REM Copy .env.example to .env
if exist ".env.example" (
    copy ".env.example" ".env" >nul
    echo ✅ Created .env file from .env.example
) else (
    echo ❌ .env.example file not found!
    pause
    exit /b 1
)

echo.
echo 📝 Please update the following variables in your .env file:
echo    - VITE_GEMINI_API_KEY: Get from https://aistudio.google.com/app/apikey
echo    - VITE_WALLET_CONNECT_PROJECT_ID: Get from https://cloud.walletconnect.com
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies with yarn...
    
    REM Enforce yarn usage only
    where yarn >nul 2>nul
    if %errorlevel% == 0 (
        echo ✅ Using yarn (required for this project)...
        yarn install
    ) else (
        echo ❌ Yarn not found! This project requires yarn as the package manager.
        echo 💡 Install yarn first: npm install -g yarn
        echo    Then run this setup script again.
        pause
        exit /b 1
    )
    
    echo ✅ Dependencies installed successfully with yarn!
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🎉 Setup complete! Next steps:
echo    1. Edit .env file with your API keys
echo    2. Run 'yarn dev' to start development server
echo    3. Visit http://localhost:5173 to see your app
echo.
echo 📚 For more information, check the README.md file
echo 🔗 Add Monad Testnet to MetaMask:
echo    - Network: Monad Testnet
echo    - RPC URL: https://testnet-rpc.monad.xyz
echo    - Chain ID: 10143
echo    - Symbol: MON
echo    - Explorer: https://testnet.monadexplorer.com
echo.
pause