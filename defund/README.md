# DeFund

AI-Verified, Agent-Controlled Crowdfunding on Monad

## Overview
DeFund is an autonomous crowdfunding protocol where:
- Funds are controlled by smart contracts
- Verification is done by AI agents (Gemini)
- Decisions are made by multi-agent consensus
- Humans do not approve or release funds

## Quick Start

### Prerequisites
- Node.js 18+
- MetaMask with Monad Testnet configured

### Installation

```bash
# Install all dependencies
cd contracts && npm install
cd ../backend && npm install
cd ../frontend && npm install
```

### Environment Setup

Create `.env` files:

**backend/.env**
```
GEMINI_API_KEY=your_key
MONAD_RPC=https://testnet-rpc.monad.xyz
PRIVATE_KEY=your_wallet_private_key
```

### Running

```bash
# Deploy contracts
cd contracts && npx hardhat run scripts/deploy.ts --network monad

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## Tech Stack
- **Blockchain**: Monad (Solidity)
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + Vite + TailwindCSS
- **AI**: Google Gemini API

## License
MIT - LNMHacks8.0
