# 🚀 MonoFi-AI

MonoFi-AI is an AI-powered DeFi portfolio intelligence system built on the Monad Blockchain, designed to convert complex on-chain data into simple, actionable portfolio insights.

---

## 🧩 Problem

DeFi users face multiple challenges:

- On-chain data is hard to interpret
- Portfolio rebalancing requires manual calculations
- Whale movements and large transactions are invisible to average users
- Existing dashboards show numbers but no guidance
- Users lack a natural language interface for DeFi decisions

---

## 💡 Solution

MonoFi-AI solves this by combining AI + Web3:

- AI interprets portfolio data and market activity
- Smart contracts handle portfolio allocation
- Real-time blockchain data is transformed into insights
- Users interact using natural language, not charts only

The result: decision-making clarity instead of data overload.

---

## ⚙️ How It Works

1. Wallet Connection
   - User connects a Web3 wallet
   - Application reads balances from Monad testnet

2. On-Chain Data Fetching
   - Token balances and transactions are fetched
   - Whale transactions are tracked from blockchain data

3. AI Analysis Layer
   - Portfolio data is sent to the AI engine
   - AI analyzes allocation, risk, and trends
   - Insights are returned in human-readable form

4. Portfolio Actions
   - AI suggests allocation changes
   - User applies changes via smart contracts
   - Transactions execute directly on-chain

---

## 🧠 AI Flow Explanation

- User asks a question (text or voice)
- Portfolio + market context is injected into the prompt
- AI generates:
  - Allocation advice
  - Token insights
  - Whale movement explanations
- Response is formatted for clarity and action

---

## 🧪 Code Architecture Explanation

### Frontend Logic
- UI built using React with TypeScript
- State and async data handled via query-based caching
- Portfolio sliders update allocations in real time

### Web3 Layer
- Wallet interactions handled via Wagmi
- Viem manages low-level blockchain calls
- Smart contracts control allocation and token flow

### AI Service Layer
- AI requests are isolated in a service module
- Portfolio data is serialized before analysis
- Responses are parsed and rendered dynamically

### Smart Contracts
- Non-custodial portfolio manager contract
- Executes allocation and rebalancing logic
- Optimized for low gas usage

---

## 🧰 Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui

### Web3
- Monad Blockchain (Testnet)
- Wagmi
- Viem
- WalletConnect

### AI & Data
- Google Gemini AI
- Web Speech API (voice input)
- On-chain data indexing
- Real-time token pricing

---

## 🔐 Security Design

- No private keys stored
- No custodial access
- Smart contracts are verified
- Sensitive logic handled client-side

---

## 🎯 Core Idea

> MonoFi-AI turns blockchain data into decisions, not just dashboards.

---

## 📄 License

MIT License  
Free to use and modify.
>>>>>>> 196ac0b (MonoFi-AI Project)
